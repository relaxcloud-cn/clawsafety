use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq)]
pub enum Language {
    Bash,
    Python,
    Yaml,
    Toml,
    Markdown,
    Json,
    Unknown,
}

impl Language {
    pub fn from_extension(ext: &str) -> Self {
        match ext {
            "sh" | "bash" => Language::Bash,
            "py" => Language::Python,
            "yaml" | "yml" => Language::Yaml,
            "toml" => Language::Toml,
            "md" => Language::Markdown,
            "json" => Language::Json,
            _ => Language::Unknown,
        }
    }
}

#[derive(Debug)]
pub struct FileContext {
    pub path: PathBuf,
    pub relative_path: String,
    pub language: Language,
    pub content: String,
    pub lines: Vec<String>,
}

impl FileContext {
    pub fn from_file(base: &Path, path: &Path) -> anyhow::Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
        let relative_path = path
            .strip_prefix(base)
            .unwrap_or(path)
            .to_string_lossy()
            .to_string();
        let language = path
            .extension()
            .and_then(|e| e.to_str())
            .map(Language::from_extension)
            .unwrap_or(Language::Unknown);

        Ok(Self {
            path: path.to_path_buf(),
            relative_path,
            language,
            content,
            lines,
        })
    }

    pub fn is_script(&self) -> bool {
        matches!(self.language, Language::Bash | Language::Python)
    }
}

#[derive(Debug)]
pub struct SkillContext {
    pub root: PathBuf,
    pub has_skill_md: bool,
    pub skill_md_content: Option<String>,
    pub has_scripts_dir: bool,
    pub has_skill_yaml: bool,
    pub skill_yaml_content: Option<String>,
}

impl SkillContext {
    pub fn from_path(path: &Path) -> anyhow::Result<Self> {
        let skill_md = path.join("SKILL.md");
        let has_skill_md = skill_md.exists();
        let skill_md_content = if has_skill_md {
            Some(std::fs::read_to_string(&skill_md)?)
        } else {
            None
        };

        let skill_yaml = path.join("skill.yaml");
        let has_skill_yaml = skill_yaml.exists();
        let skill_yaml_content = if has_skill_yaml {
            Some(std::fs::read_to_string(&skill_yaml)?)
        } else {
            None
        };

        Ok(Self {
            root: path.to_path_buf(),
            has_skill_md,
            skill_md_content,
            has_scripts_dir: path.join("scripts").is_dir(),
            has_skill_yaml,
            skill_yaml_content,
        })
    }
}
