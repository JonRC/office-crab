use std::{env, ops::Range, sync::Arc, time::Instant};

use office_password::{
    char_sets::generate_alpha_numeric_with_special, nth_password::nth_password,
    test_password_async::test_password_async,
};
use tokio::{sync::Mutex, task::JoinSet};

#[tokio::main]
async fn main() {
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
    async_with_tokio(range_start..range_end).await;
    let duration = start.elapsed();
    println!("{}", duration.as_secs_f64())
}

async fn async_with_tokio(range: Range<usize>) {
    let char_set = generate_alpha_numeric_with_special();
    let char_set_arc = Arc::new(char_set);
    let password: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));

    let futures: Vec<_> = range
        .into_iter()
        .map(move |nth| {
            let charset_clone = Arc::clone(&char_set_arc);
            let password_clone = Arc::clone(&password);
            async move {
                let password = nth_password(&*charset_clone, 6, nth);
                let is_valid = test_password_async(&password).await.unwrap();
                if is_valid {
                    password_clone.lock().await.replace(password);
                }
            }
        })
        .collect();

    let mut set = JoinSet::new();

    for future in futures {
        set.spawn(future);
    }

    while let Some(_) = set.join_next().await {}
}
