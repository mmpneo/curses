use std::io;
use std::fmt::Display;

/// Little helper extension to add a better error message to an io::Error
pub trait ResultExt {
    fn with_context<D: Display>(self, message: impl FnOnce() -> D) -> Self;
}
impl<T> ResultExt for io::Result<T> {
    fn with_context<D: Display>(self, message: impl FnOnce() -> D) -> Self {
        self.map_err(|e| {
            let kind = e.kind();
            let error = format!("{}: {}", message(), e);
            io::Error::new(kind, error)
        })
    }
}