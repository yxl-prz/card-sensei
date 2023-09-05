use std::sync::Arc;

use axum::{
    extract::{Path, State},
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use minijinja::context;

mod api;
mod database;
mod template;

async fn expression(
    State(app): State<Arc<App>>,
    Path(expression): Path<String>,
) -> impl IntoResponse {
    let mut exp = app
        .database
        .get_expressions(&expression)
        .await
        .unwrap_or_default();
    exp.sort_by(|a, b| {
        if a.expression == expression {
            std::cmp::Ordering::Less
        } else if a.expression.len() > b.expression.len() {
            std::cmp::Ordering::Greater
        } else {
            std::cmp::Ordering::Less
        }
    });
    // Exact matches to the top + sort by length
    if exp.len() == 0 {
        Json(api::types::ExpressionResponse::builder(404))
    } else {
        Json(
            api::types::ExpressionResponse::builder(200)
                .set_expression(
                    exp.iter()
                        .take(database::constants::WORD_RESPONSE_LIMIT)
                        .map(|x| x.to_owned())
                        .collect(),
                )
                .set_sentence(
                    app.database
                        .get_sentences(&expression)
                        .await
                        .unwrap_or_default()
                        .iter()
                        .take(database::constants::SENTENCE_RESPONSE_LIMIT)
                        .map(|x| x.to_owned())
                        .collect(),
                ),
        )
    }
}

async fn index(State(app): State<Arc<App>>) -> impl IntoResponse {
    Html(
        app.template
            .env
            .get_template("index.html")
            .unwrap()
            .render(context! {})
            .unwrap(),
    )
}

async fn cards(State(app): State<Arc<App>>) -> impl IntoResponse {
    Html(
        app.template
            .env
            .get_template("cards.html")
            .unwrap()
            .render(context! {})
            .unwrap(),
    )
}

struct App {
    database: database::Handler,
    template: template::Environment,
}

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
    dotenv::dotenv().ok().unwrap();
    let database_url = dotenv::var("DATABASE_URL").unwrap();

    let application = App {
        database: database::Handler::new(&database_url).await.unwrap(),
        template: {
            let mut a = template::Environment::new();
            a.set_templates("./public/templates");
            a
        },
    };

    let app = Router::new()
        .route("/", get(index))
        .route("/cards", get(cards))
        .route("/expression/:expression", get(expression))
        .nest_service(
            "/assets",
            tower_http::services::ServeDir::new("./public/assets"),
        )
        .with_state(Arc::new(application));

    axum::Server::bind(&"0.0.0.0:80".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
    Ok(())
}
