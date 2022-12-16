use std::ops::{Deref, DerefMut};

use windows::core::Interface;

#[derive(Debug)]
pub struct Intf<I: Interface>(pub I);

unsafe impl<I: Interface> Send for Intf<I> {}
unsafe impl<I: Interface> Sync for Intf<I> {}

impl<I: Interface> Deref for Intf<I> {
    type Target = I;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<I: Interface> DerefMut for Intf<I> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}
