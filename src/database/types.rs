use std::collections::HashMap;

use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Word {
    #[serde(skip_serializing)]
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub expression: String,
    pub reading: String,
    pub definitions: HashMap<String, Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pitches: Option<Vec<WordPitch>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WordPitch {
    drop: i16,
    notation: Vec<char>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sentence {
    #[serde(skip_serializing)]
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub sentence: String,
    pub translations: HashMap<String, Vec<String>>,
    pub markdown: Option<String>,
    pub audio: Option<SentenceAudio>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SentenceAudio {
    pub id: String,
    pub url: String,
    pub user: String,
}
