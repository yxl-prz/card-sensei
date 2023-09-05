use mongodb::{
    bson::{doc, Regex},
    Cursor,
};
use serde::de::DeserializeOwned;

pub mod constants;
pub mod types;

pub struct Handler {
    client: mongodb::Client,
}

impl Handler {
    pub async fn new(connection_string: &str) -> mongodb::error::Result<Handler> {
        let mut client_options = mongodb::options::ClientOptions::parse(connection_string).await?;
        let server_api = mongodb::options::ServerApi::builder()
            .version(mongodb::options::ServerApiVersion::V1)
            .build();
        client_options.server_api = Some(server_api);

        let client = mongodb::Client::with_options(client_options)?;
        mongodb::error::Result::Ok(Handler { client: client })
    }

    pub async fn get_expressions(
        &self,
        exp: &str,
    ) -> Result<Vec<types::Word>, Box<dyn std::error::Error>> {
        self.find_and_collect::<types::Word>(
            doc! {
                "expression": Regex { pattern: format!("{}", exp), options: "".to_string() }
            },
            constants::DATABASE_NAME,
            constants::WORD_COLLECTION,
            Some(
                mongodb::options::FindOptions::builder()
                    .sort(doc! {
                        "expression": -1
                    })
                    .build(),
            ),
        )
        .await
    }

    pub async fn get_sentences(
        &self,
        exp: &str,
    ) -> Result<Vec<types::Sentence>, Box<dyn std::error::Error>> {
        self.find_and_collect::<types::Sentence>(
            doc! {
                "sentence": Regex { pattern: format!("{}", exp), options: "".to_string() }
            },
            constants::DATABASE_NAME,
            constants::SENTENCE_COLLECTION,
            Some(
                mongodb::options::FindOptions::builder()
                    .sort(doc! {
                        "expression": -1
                    })
                    .build(),
            ),
        )
        .await
    }

    async fn find_and_collect<T>(
        &self,
        exp: impl Into<Option<mongodb::bson::Document>>,
        database_name: &str,
        collection: &str,
        options: impl Into<Option<mongodb::options::FindOptions>>,
    ) -> Result<Vec<T>, Box<dyn std::error::Error>>
    where
        T: DeserializeOwned,
    {
        let mut resp: Cursor<T> = match self
            .client
            .database(database_name)
            .collection(collection)
            .find(exp, options)
            .await
        {
            Ok(w) => w,
            Err(e) => return Err(Box::new(e)),
        };

        let mut res: Vec<T> = Vec::new();
        while resp.advance().await.unwrap_or(false) {
            match resp.deserialize_current() {
                Ok(i) => res.push(i),
                Err(_err) => {}
            }
        }

        Ok(res)
    }
}
