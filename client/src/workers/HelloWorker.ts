export class HelloWorker implements IWorker {
    Name: string = "HelloWorker"
    Priority: number = 999
    Do(): void {
        console.log("Executing " + this.Name)
    }
}
