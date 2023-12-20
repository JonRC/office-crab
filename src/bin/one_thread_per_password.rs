use std::{
    env,
    ops::Range,
    sync::Arc,
    thread::{self, JoinHandle},
};

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

    let time = std::time::Instant::now();
    one_thread_per_password(range_start..range_end);

    let elapsed = time.elapsed();
    println!("{}", elapsed.as_secs_f64());
}

fn one_thread_per_password(password_range: Range<usize>) -> Option<String> {
    setup_dependencies();

    let batch_size = 30;
    let char_set = generate_alpha_numeric_with_special();
    let char_set_arc = Arc::new(char_set);

    let mut right_password: Option<String> = None;

    let mut handlers: Vec<JoinHandle<Option<String>>> = Vec::new();

    for nth in password_range {
        let wait_for_threads = (nth % batch_size) == 0;
        let chat_set_arc_clone = Arc::clone(&char_set_arc);

        let batch_handlers = thread::spawn(move || {
            let password = nth_password(&*chat_set_arc_clone, 6, nth);
            let is_valid = test_password(&password).unwrap();

            if is_valid {
                return Some(password);
            };

            return None;
        });

        handlers.push(batch_handlers);

        if wait_for_threads {
            for handler in handlers {
                let result = handler.join().unwrap();
                if let Some(password) = result {
                    right_password = Some(password);
                    // break;
                }
            }
            handlers = Vec::new();
        }

        if right_password.is_some() {
            // break;
        }
    }

    return right_password;
}
