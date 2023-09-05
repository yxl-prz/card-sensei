use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExpressionResponse {
    pub status: i16,
    pub expression: Vec<crate::database::types::Word>,
    pub sentence: Vec<crate::database::types::Sentence>,
}

impl ExpressionResponse {
    pub fn builder(status: i16) -> ExpressionResponse {
        ExpressionResponse {
            status: status,
            expression: Vec::new(),
            sentence: Vec::new(),
        }
    }
    pub fn set_expression(mut self, exp: Vec<crate::database::types::Word>) -> ExpressionResponse {
        self.expression = exp;
        self
    }
    pub fn set_sentence(
        mut self,
        sentence: Vec<crate::database::types::Sentence>,
    ) -> ExpressionResponse {
        self.sentence = sentence;
        self
    }
}
