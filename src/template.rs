pub struct Environment {
    pub env: minijinja::Environment<'static>,
}

impl Environment {
    pub fn new() -> Environment {
        Environment {
            env: minijinja::Environment::new(),
        }
    }
    pub fn set_templates(&mut self, path: &str) {
        self.env.set_loader(minijinja::path_loader(path));
    }
}
