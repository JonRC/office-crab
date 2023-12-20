use std::{
    env,
    ops::Range,
    sync::Arc,
    thread::{self, JoinHandle},
    time::Instant,
};

use office_password::{
    char_sets::generate_alpha_numeric_with_special, nth_password::nth_password,
    test_password::test_password,
};

use num_cpus;

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
    one_thread_per_batch(range_start, range_end);
    let elapsed = start.elapsed();

    println!("{}", elapsed.as_secs_f64());
}

fn one_thread_per_batch(range_start: usize, range_end: usize) -> Option<String> {
    let char_set = generate_alpha_numeric_with_special();
    let char_set_arc = Arc::new(char_set);

    let mut right_password: Option<String> = None;
    let password_quantity = (range_end - range_start) as f32;
    let threads = num_cpus::get();

    let range_batches: Vec<Range<usize>> = (0..threads)
        .map(|i| {
            let length = (password_quantity / threads as f32).floor() as usize;
            let start = (length * i) + range_start;
            let mut end = (length * (i + 1)) + range_start;
            if i == threads - 1 {
                end = range_end;
            }
            start..end
        })
        .collect();

    type Handler = JoinHandle<Option<String>>;
    let mut handlers: Vec<Handler> = Vec::new();

    for range in range_batches {
        let char_set_arc = Arc::clone(&char_set_arc);
        let handler = thread::spawn(move || {
            for nth in range {
                let password = nth_password(&*char_set_arc, 6, nth);
                let is_right = test_password(&password).unwrap();
                if is_right {
                    return Some(password);
                    // break;
                }
            }
            None
        });
        handlers.push(handler);
    }

    for handler in handlers {
        let result = handler.join().unwrap();
        if let Some(password) = result {
            right_password = Some(password);
            //TODO: cancel other threads
        }
    }

    return right_password;
}
