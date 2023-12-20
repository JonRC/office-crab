use std::{env, ops::Range, time::Instant};

use office_password::{
    char_sets::generate_alpha_numeric_with_special, nth_password::nth_password,
    setup_dependencies::setup_dependencies, test_password::test_password,
};

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
        .unwrap_or(1000);

    let start = Instant::now();
    single_thread(range_start..range_end);
    let duration = start.elapsed();
    println!("{}", duration.as_secs_f64())
}

fn single_thread(password_range: Range<usize>) -> Option<String> {
    setup_dependencies();

    let char_set = generate_alpha_numeric_with_special();
    let mut right_password: Option<String> = None;

    for nth in password_range {
        let password = nth_password(&char_set, 6, nth);
        let is_right = test_password(&password).unwrap();
        if is_right {
            right_password = Some(password);
            // break;
        }
    }

    return right_password;
}
