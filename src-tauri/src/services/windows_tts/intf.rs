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

// impl<'p, P: Interface, I: Interface + IntoParam<'p, P>> IntoParam<'p, P> for Intf<I> {
//     fn into_param(self) -> Param<'p, P> {
//         self.0.into_param()
//     }
// }

// impl<'p, P: Interface, I: Interface> IntoParam<'p, P> for &'p Intf<I>
// where
//     &'p I: IntoParam<'p, P>,
// {
//     fn into_param(self) -> Param<'p, P> {
//         (&self.0).into_param()
//     }
// }
