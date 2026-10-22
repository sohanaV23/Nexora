import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

def train_and_evaluate():
    data_path = 'ml-service/data/apartment_complaints.csv'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples across {df['category'].nunique()} categories.")
    print("Class distribution:\n", df['category'].value_counts())

    # Combine title and description for richer representation
    df['text'] = df['title'] + " " + df['description']
    X = df['text']
    y = df['category']

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"\nTraining set size: {len(X_train)} | Test set size: {len(X_test)}")

    # Pipeline: TF-IDF Vectorizer + Logistic Regression Classifier
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1500,
            sublinear_tf=True,
            strip_accents='unicode'
        )),
        ('clf', LogisticRegression(
            C=2.0,
            max_iter=300,
            random_state=42
        ))
    ])

    print("\nTraining TF-IDF + Logistic Regression Pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n" + "="*50)
    print(f"HELD-OUT TEST ACCURACY: {acc * 100:.2f}%")
    print("="*50)
    print("\nClassification Report:\n", classification_report(y_test, y_pred, zero_division=0))

    # Confusion matrix
    labels = sorted(list(df['category'].unique()))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    print("\nConfusion Matrix Shape:", cm.shape)

    # Save model artifact
    os.makedirs('ml-service/models', exist_ok=True)
    model_path = 'ml-service/models/complaint_classifier.joblib'
    joblib.dump(pipeline, model_path)
    print(f"\nModel artifact successfully saved to: {model_path}")

    return acc

if __name__ == '__main__':
    train_and_evaluate()
