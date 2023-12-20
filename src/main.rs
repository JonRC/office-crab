mod char_sets;
mod nth_password;
mod test_password;
mod test_password_async;

use num_cpus;
// use std::time;
// use test_password::test_password;

// use crate::nth_password::nth_password;

// use std::sync::Arc;
// use std::thread::{self, JoinHandle};

// use crate::char_sets::generate_number_set;
// use crate::nth_password::nth_password;
// use crate::test_password::test_password;

// mod tests;
// mod lib;
fn main() {
    println!("{}", num_cpus::get());
}

// 0: 0..10000
// 1: 10000..20000
// 2: 20000..30000
// 3: 30000..40000
