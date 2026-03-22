mod terminal;
mod json;

pub use terminal::TerminalReporter;
pub use json::JsonReporter;

use crate::rules::Finding;
use crate::scoring::ScoreResult;

pub trait Reporter {
    fn report(&self, findings: &[Finding], score: &ScoreResult, path: &str);
}
