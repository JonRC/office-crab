pub fn nth_password(char_set: &[char], width: u32, nth: usize) -> String {
    (0..width)
        .rev()
        .map(|i| {
            let dimension = nth / char_set.len().pow(i);
            let position = dimension % char_set.len();

            char_set[position]
        })
        .collect()
}
