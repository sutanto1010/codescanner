CREATE TABLE public.finding (
    id character varying(36) NOT NULL,
    scan_id character varying(36),
    file_path text,
    rule_id character varying(36),
    created timestamp with time zone,
    type character varying(100),
    line_number integer,
    line_preview text,
    line_commit_by character varying(255),
    line_commit_date timestamp with time zone,
    line_commit_subject text,
    branch character varying(255)
);


ALTER TABLE public.finding OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16395)
-- Name: repository; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repository (
    id character varying(36) NOT NULL,
    name character varying(255),
    url character varying(1000),
    status character varying(50),
    created timestamp with time zone,
    created_by character varying(36),
    description text,
    last_scan timestamp with time zone
);


ALTER TABLE public.repository OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16405)
-- Name: rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rule (
    id character varying(36) NOT NULL,
    code character varying(100),
    name character varying(255),
    description text,
    created timestamp with time zone,
    created_by character varying(36),
    enable boolean,
    severity character varying(100),
    pattern character varying(500)
);


ALTER TABLE public.rule OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 16402)
-- Name: scan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan (
    id character varying(36) NOT NULL,
    queue_at timestamp with time zone,
    repository_id character varying(36),
    queue_by character varying(36),
    scan_start timestamp with time zone,
    scan_end timestamp with time zone,
    scan_progress smallint,
    status character varying(100)
);


ALTER TABLE public.scan OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16445)
-- Name: vw_finding; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_finding AS
 SELECT f.id,
    f.scan_id,
    f.file_path,
    f.rule_id,
    f.created,
    f.type,
    f.line_number,
    f.line_preview,
    f.line_commit_by,
    f.line_commit_date,
    f.line_commit_subject,
    f.branch,
    r.name AS repository_name,
    r.url AS repository_url,
    ru.name AS rule_name,
    ru.severity AS rule_severity
   FROM (((public.finding f
     LEFT JOIN public.scan s ON (((f.scan_id)::text = (s.id)::text)))
     LEFT JOIN public.repository r ON (((s.repository_id)::text = (r.id)::text)))
     LEFT JOIN public.rule ru ON (((ru.id)::text = (f.rule_id)::text)));


ALTER TABLE public.vw_finding OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16462)
-- Name: vw_scan; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_scan AS
 SELECT s.id,
    s.queue_at,
    s.repository_id,
    s.queue_by,
    s.scan_start,
    s.scan_end,
    s.scan_progress,
    s.status,
    r.name AS repository_name,
    r.url AS repository_url
   FROM (public.scan s
     LEFT JOIN public.repository r ON (((s.repository_id)::text = (r.id)::text)));


ALTER TABLE public.vw_scan OWNER TO postgres;