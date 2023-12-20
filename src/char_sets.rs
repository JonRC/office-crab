pub fn generate_alpha_numeric_with_special() -> Vec<char> {
    let mut alpha_numeric_with_special = ['a'..='z', 'A'..='Z', '0'..='9']
        .into_iter()
        .flatten()
        .into_iter()
        .collect::<Vec<char>>();

    alpha_numeric_with_special.extend([
        '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=',
    ]);

    alpha_numeric_with_special
}

pub fn generate_number_set() -> Vec<char> {
    let number_set = ['0'..='9']
        .into_iter()
        .flatten()
        .into_iter()
        .collect::<Vec<char>>();

    number_set
}
