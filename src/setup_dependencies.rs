use std::os::unix::fs::PermissionsExt;

pub fn setup_dependencies() {
    let binary_path = "runtime-bin/msoffice-crypt";
    let binary_vec = include_bytes!("../msoffice/bin/msoffice-crypt");

    if !std::path::Path::new(binary_path).exists() {
        std::fs::create_dir_all("runtime-bin").unwrap();
        std::fs::write(binary_path, binary_vec).unwrap();
        std::fs::set_permissions(binary_path, std::fs::Permissions::from_mode(0o755)).unwrap();
    }
}
