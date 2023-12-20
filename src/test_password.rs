use std::process::Command;

pub fn test_password(password: &str) -> Result<bool, String> {
    let binary_path = "runtime-bin/msoffice-crypt";

    let test_command = Command::new(binary_path)
        .arg("-d")
        .arg("-p")
        .arg(password)
        .arg("samples/sample_1MB.xlsx")
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .expect("Failed to execute process");

    match test_command.code() {
        Some(0) => return Ok(true),
        _ => return Ok(false),
    }
}
