use std::{
    env,
    ops::Range,
    sync::{Arc, Mutex},
    time::Instant,
};

use office_password::{
    char_sets::generate_alpha_numeric_with_special, nth_password, test_password::test_password,
};
use rayon::prelude::*;

fn main() {
    let args = env::args().collect::<Vec<String>>();
    let range_start = args
        .get(1)
        .unwrap_or(&String::from("0"))
        .parse::<usize>()
        .unwrap_or(0);
    let range_end = args
        .get(2)
        .unwrap_or(&String::from("10000"))
        .parse::<usize>()
        .unwrap_or(10000);

    let start = Instant::now();
    async_with_rayon(range_start..range_end);
    let duration = start.elapsed();
    println!("{}", duration.as_secs_f64())
}

pub fn async_with_rayon(range: Range<usize>) -> Option<String> {
    let char_set = generate_alpha_numeric_with_special();
    let char_set_arc = Arc::new(char_set);
    let valid_password: Option<String> = None;
    let valid_password_mutex = Arc::new(Mutex::new(valid_password));

    range.into_par_iter().for_each(|nth| {
        let charset_clone = Arc::clone(&char_set_arc);
        let password = nth_password::nth_password(&*charset_clone, 6, nth);
        let is_valid = test_password(&password).unwrap();
        if is_valid {
            valid_password_mutex
                .clone()
                .lock()
                .unwrap()
                .replace(password);
        }
    });

    return (*valid_password_mutex.clone().lock().unwrap()).clone();
}
