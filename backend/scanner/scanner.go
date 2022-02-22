package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
	"time"

	"github.com/sutanto1010/codescanner/enums"
)

func DoScan(req map[string]interface{}) {
	fmt.Println("Scanning...")
	scanId := req["id"].(string)
	url := req["url"].(string)
	if !strings.HasSuffix(url, ".git") {
		url = url + ".git"
	}
	scan, _ := repo.FindByID("scan", scanId)
	repository, _ := repo.FindByID("repository", req["repository_id"])
	//Get Rules
	repository["status"] = enums.SCAN_IN_PROGRESS
	scan["status"] = enums.SCAN_IN_PROGRESS
	scan["scan_start"] = time.Now()
	repo.Update("repository", repository)
	repo.Update("scan", scan)
	rules := repo.GetAll("rule")
	//Clone repository
	cloneCmd := exec.Command("git", "clone", url, scanId)
	cloneCmd.Dir = conf.SCANNER_WORKING_DIR
	RunAndReturn(cloneCmd)
	//Get branch list
	branchCmd := exec.Command("git", "branch", "-r", "--format='%(refname:short)'")
	branchCmd.Dir = path.Join(conf.SCANNER_WORKING_DIR, scanId)
	outStr, _ := RunAndReturn(branchCmd)
	lines := strings.Split(outStr, "\n")
	for _, line := range lines {
		line = strings.Trim(line, "'")
		temp := strings.Split(line, "/")
		if len(temp) <= 1 {
			continue
		}
		branchName := temp[len(temp)-1]
		if branchName == "HEAD" {
			continue
		}
		// Git Checkout
		checkoutCmd := exec.Command("git", "checkout", branchName)
		checkoutCmd.Dir = path.Join(conf.SCANNER_WORKING_DIR, scanId)
		RunAndReturn(checkoutCmd)
		// Get All Files
		filesCmd := exec.Command("git", "ls-files")
		filesCmd.Dir = path.Join(conf.SCANNER_WORKING_DIR, scanId)
		outStr, _ = RunAndReturn(filesCmd)
		files := strings.Split(outStr, "\n")
		for _, file := range files {
			//Assume file is not possible to be large, because it's source code
			//So it's safe to read all file content at once
			filePath := path.Join(conf.SCANNER_WORKING_DIR, scanId, file)
			data, err := ioutil.ReadFile(filePath)
			if err != nil {
				fmt.Println(err.Error())
				continue
			}
			fileContent := string(data)
			contentLines := strings.Split(fileContent, "\n")
			//Check each rule
			prevLine := ""
			totalLineNumber := len(contentLines)
			for lineNumber, contentLine := range contentLines {
				usedLineNumber := lineNumber + 1
				for _, rule := range rules {
					fmt.Println(lineNumber+1, " => ", contentLine)
					pattern := rule["pattern"].(string)
					match, _ := regexp.MatchString(pattern, contentLine)
					if match {
						preview := ""
						if usedLineNumber > 1 {
							preview = fmt.Sprintf("%v\t", usedLineNumber-1) + prevLine + "\n"
						}
						preview += fmt.Sprintf("%v\t", usedLineNumber) + contentLine + "\n"
						if lineNumber+1 < totalLineNumber {
							preview += fmt.Sprintf("%v\t", usedLineNumber+1) + contentLines[usedLineNumber] + "\n"
						}

						//Get last modification information for the line
						lineInfoCmd := exec.Command(
							"git",
							"log",
							"-1",
							"-L",
							fmt.Sprintf("%v,%v:%v", usedLineNumber, usedLineNumber, file),
							`--pretty="%an###%ai###%s`,
							"-s",
						)
						lineInfoCmd.Dir = path.Join(conf.SCANNER_WORKING_DIR, scanId)
						outStr, _ = RunAndReturn(lineInfoCmd)
						logLines := strings.Split(outStr, "###")
						commitSubject := logLines[2]
						commitAuthor := logLines[0]
						commitDate := logLines[1]
						commitSubject = strings.Trim(commitSubject, `"`)
						commitAuthor = strings.Trim(commitAuthor, `"`)
						commitDate = strings.Trim(commitDate, `"`)
						finding := map[string]interface{}{
							"scan_id":             scanId,
							"file_path":           file,
							"line_number":         usedLineNumber,
							"line_preview":        preview,
							"line_commit_by":      commitAuthor,
							"line_commit_date":    commitDate,
							"line_commit_subject": commitSubject,
							"branch":              branchName,
							"rule_id":             rule["id"],
						}
						_, err = repo.Insert("finding", finding)
						if err != nil {
							fmt.Println(err.Error())
						}
					}
				}
				prevLine = contentLine
			}
		}
	}
	//Clean up
	os.RemoveAll(path.Join(conf.SCANNER_WORKING_DIR, scanId))
	repository["status"] = enums.SCAN_SUCCESS
	scan["status"] = enums.SCAN_SUCCESS
	scan["scan_end"] = time.Now()
	repo.Update("repository", repository)
	repo.Update("scan", scan)
	scanCount.Decrement()
}

func RunAndReturn(cmd *exec.Cmd) (string, error) {
	out, err := cmd.Output()
	cmd.Wait()
	if err != nil {
		log.Print(err.Error())
	}
	return string(out), err
}
