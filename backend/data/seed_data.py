"""
Synthetic scam corpus for EchoTrace AI.
80+ entries across 6 fraud families spanning 2020-2025.
Demonstrates linguistic evolution of the same fraud intent over time.
"""
from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from services.embedding_service import EmbeddingService
    from services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# SEED CORPUS — 82 synthetic scam messages
# Fields: text, scam_family, year, cluster_id, confidence_score, source_label
# ─────────────────────────────────────────────────────────────────────────────

SEED_DATA: list[dict] = [

    # ═══════════════════════════════════════════
    # BANKING FRAUD  (cluster_id=0)  20 entries
    # Evolution: Account freeze → KYC update → OTP theft → Verification scam
    # ═══════════════════════════════════════════
    {
        "text": "Your bank account has been blocked due to suspicious activity. Call 1800-XXX-XXXX immediately to unblock your account.",
        "scam_family": "Banking Fraud", "year": 2020, "cluster_id": 0, "confidence_score": 0.88, "source_label": "SMS"
    },
    {
        "text": "URGENT: Your SBI account has been temporarily suspended. Visit the nearest branch with your Aadhaar card to restore access.",
        "scam_family": "Banking Fraud", "year": 2020, "cluster_id": 0, "confidence_score": 0.85, "source_label": "SMS"
    },
    {
        "text": "Dear customer, your KYC documents have expired. Update your KYC within 24 hours to avoid account suspension. Click: bit.ly/xxxxx",
        "scam_family": "Banking Fraud", "year": 2021, "cluster_id": 0, "confidence_score": 0.91, "source_label": "SMS"
    },
    {
        "text": "Your HDFC Bank KYC is incomplete. Failure to update KYC will result in account deactivation. Update now at hdfc-kyc-update.com",
        "scam_family": "Banking Fraud", "year": 2021, "cluster_id": 0, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "OTP verification required. Share your 6-digit OTP sent to your registered mobile to confirm your identity and prevent account lock.",
        "scam_family": "Banking Fraud", "year": 2022, "cluster_id": 0, "confidence_score": 0.87, "source_label": "WhatsApp"
    },
    {
        "text": "Your bank has detected unauthorized access. Enter OTP received on +91-XXXX to cancel the transaction. Do not share this OTP with anyone.",
        "scam_family": "Banking Fraud", "year": 2022, "cluster_id": 0, "confidence_score": 0.90, "source_label": "SMS"
    },
    {
        "text": "Security alert: Suspicious transaction of Rs 24,999 detected on your account. Verify transaction via OTP or call our fraud helpline.",
        "scam_family": "Banking Fraud", "year": 2023, "cluster_id": 0, "confidence_score": 0.93, "source_label": "SMS"
    },
    {
        "text": "Your account security verification is pending. Complete digital KYC re-verification at secure-bank-verify.in within 48 hours.",
        "scam_family": "Banking Fraud", "year": 2023, "cluster_id": 0, "confidence_score": 0.92, "source_label": "Email"
    },
    {
        "text": "Urgent: Complete your RBI-mandated digital verification to maintain uninterrupted banking services. Click to verify identity.",
        "scam_family": "Banking Fraud", "year": 2024, "cluster_id": 0, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "Your account has been flagged for review. Authenticate via biometric verification link to avoid automatic deactivation.",
        "scam_family": "Banking Fraud", "year": 2024, "cluster_id": 0, "confidence_score": 0.88, "source_label": "WhatsApp"
    },
    {
        "text": "AI-powered fraud detection has flagged your account. Complete identity re-confirmation using our secure portal immediately.",
        "scam_family": "Banking Fraud", "year": 2025, "cluster_id": 0, "confidence_score": 0.91, "source_label": "Email"
    },
    {
        "text": "Critical: Your net banking credentials may have been compromised. Reset your MPIN using the secure link to prevent unauthorized access.",
        "scam_family": "Banking Fraud", "year": 2025, "cluster_id": 0, "confidence_score": 0.89, "source_label": "SMS"
    },
    {
        "text": "Dear valued customer, annual account security audit requires immediate re-verification of your PAN and Aadhaar. Link: bank-audit.co",
        "scam_family": "Banking Fraud", "year": 2022, "cluster_id": 0, "confidence_score": 0.86, "source_label": "Email"
    },
    {
        "text": "Your credit card has been used for an international transaction. If this was not you, block your card immediately by clicking here.",
        "scam_family": "Banking Fraud", "year": 2021, "cluster_id": 0, "confidence_score": 0.84, "source_label": "SMS"
    },
    {
        "text": "ICICI Bank: Your account shows unusual login attempts. Verify account ownership by entering Debit Card details at icici-secure.net",
        "scam_family": "Banking Fraud", "year": 2023, "cluster_id": 0, "confidence_score": 0.92, "source_label": "Email"
    },
    {
        "text": "Your FD maturity has been processed. To receive funds, complete video KYC within 72 hours. Schedule your appointment: link",
        "scam_family": "Banking Fraud", "year": 2024, "cluster_id": 0, "confidence_score": 0.87, "source_label": "WhatsApp"
    },
    {
        "text": "Alert: New device login detected for your net banking. If not you, immediately secure your account by resetting credentials here.",
        "scam_family": "Banking Fraud", "year": 2025, "cluster_id": 0, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "Your account has been put on hold due to incomplete e-KYC. Update your documents to restore full banking privileges.",
        "scam_family": "Banking Fraud", "year": 2020, "cluster_id": 0, "confidence_score": 0.83, "source_label": "SMS"
    },
    {
        "text": "Transaction declined: Account verification required. Complete 2-factor authentication to re-enable your debit card.",
        "scam_family": "Banking Fraud", "year": 2023, "cluster_id": 0, "confidence_score": 0.88, "source_label": "SMS"
    },
    {
        "text": "Zero-trust security policy update: Your banking session requires re-authentication. Scan QR code to verify your identity.",
        "scam_family": "Banking Fraud", "year": 2025, "cluster_id": 0, "confidence_score": 0.86, "source_label": "Email"
    },

    # ═══════════════════════════════════════════
    # JOB SCAM  (cluster_id=1)  15 entries
    # Evolution: WFH data entry → Part-time commissions → Fake recruiter → Task fraud
    # ═══════════════════════════════════════════
    {
        "text": "Work from home opportunity! Earn Rs 15,000/month doing simple data entry. No experience required. Pay Rs 499 registration fee.",
        "scam_family": "Job Scam", "year": 2020, "cluster_id": 1, "confidence_score": 0.85, "source_label": "WhatsApp"
    },
    {
        "text": "Congratulations! You have been selected for a part-time social media management role. Salary: Rs 25,000. Training fee: Rs 999.",
        "scam_family": "Job Scam", "year": 2021, "cluster_id": 1, "confidence_score": 0.87, "source_label": "Email"
    },
    {
        "text": "Amazon work from home job: Like products and earn Rs 50-500 per task. Flexible hours. Registration: Rs 1,500 (refundable).",
        "scam_family": "Job Scam", "year": 2022, "cluster_id": 1, "confidence_score": 0.89, "source_label": "WhatsApp"
    },
    {
        "text": "Hi, I'm a recruiter from TCS. We found your profile on LinkedIn. Urgent opening for remote developer. Interview fee: Rs 2,000.",
        "scam_family": "Job Scam", "year": 2022, "cluster_id": 1, "confidence_score": 0.86, "source_label": "WhatsApp"
    },
    {
        "text": "You are shortlisted for a Google remote position. To proceed, pay Rs 3,500 for background verification and training materials.",
        "scam_family": "Job Scam", "year": 2023, "cluster_id": 1, "confidence_score": 0.91, "source_label": "Email"
    },
    {
        "text": "Freelance video rating task: Complete 30 tasks daily, earn Rs 1,200/day. Join Telegram group for tasks. Deposit Rs 500 to start.",
        "scam_family": "Job Scam", "year": 2023, "cluster_id": 1, "confidence_score": 0.88, "source_label": "Telegram"
    },
    {
        "text": "High-paying remote job alert: Digital marketing executive, salary 45k/month. Send Aadhaar and pay Rs 2,000 for document processing.",
        "scam_family": "Job Scam", "year": 2024, "cluster_id": 1, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "AI content moderation role: Work from home, Rs 500/hour. Immediate joining. Security deposit Rs 5,000 refunded after 1 month.",
        "scam_family": "Job Scam", "year": 2024, "cluster_id": 1, "confidence_score": 0.87, "source_label": "WhatsApp"
    },
    {
        "text": "Part-time investment coaching assistant role. Earn 20% commission. Attend paid training session at Rs 1,800 to get certified.",
        "scam_family": "Job Scam", "year": 2025, "cluster_id": 1, "confidence_score": 0.89, "source_label": "Telegram"
    },
    {
        "text": "Verified remote job: Product tester for Flipkart. Earn Rs 800 per product tested. Pay Rs 2,500 refundable membership to join.",
        "scam_family": "Job Scam", "year": 2025, "cluster_id": 1, "confidence_score": 0.91, "source_label": "WhatsApp"
    },
    {
        "text": "Urgent hiring: Online customer support for US company. Salary $1,500/month. Send passport copy and pay $50 for background check.",
        "scam_family": "Job Scam", "year": 2021, "cluster_id": 1, "confidence_score": 0.84, "source_label": "Email"
    },
    {
        "text": "Congratulations! Your resume was selected by Infosys HR. To confirm your appointment, pay Rs 3,000 as security deposit.",
        "scam_family": "Job Scam", "year": 2023, "cluster_id": 1, "confidence_score": 0.90, "source_label": "SMS"
    },
    {
        "text": "Easy money: Watch YouTube videos and earn Rs 200 per video. Join our paid membership at Rs 1,000 to unlock tasks.",
        "scam_family": "Job Scam", "year": 2022, "cluster_id": 1, "confidence_score": 0.86, "source_label": "Telegram"
    },
    {
        "text": "Remote NFT project assistant needed. Crypto payments, $2,000/week. Pay 0.05 ETH as wallet activation fee to receive first payment.",
        "scam_family": "Job Scam", "year": 2024, "cluster_id": 1, "confidence_score": 0.88, "source_label": "Telegram"
    },
    {
        "text": "AI prompt engineer trainee opening. 6-month contract. Rs 60,000/month. Registration and equipment deposit: Rs 8,000.",
        "scam_family": "Job Scam", "year": 2025, "cluster_id": 1, "confidence_score": 0.87, "source_label": "Email"
    },

    # ═══════════════════════════════════════════
    # UPI / PAYMENT SCAM  (cluster_id=2)  15 entries
    # Evolution: Refund UPI → Request money scams → Screen share → QR code fraud
    # ═══════════════════════════════════════════
    {
        "text": "Your electricity bill payment failed. Rs 4,200 will be deducted again. To prevent double debit, click this link to cancel.",
        "scam_family": "UPI/Payment Scam", "year": 2021, "cluster_id": 2, "confidence_score": 0.86, "source_label": "SMS"
    },
    {
        "text": "Refund initiated for your Amazon order. Enter your UPI PIN to receive Rs 1,299 refund directly to your bank account.",
        "scam_family": "UPI/Payment Scam", "year": 2021, "cluster_id": 2, "confidence_score": 0.89, "source_label": "SMS"
    },
    {
        "text": "Your Paytm wallet has Rs 2,500 cashback pending. Collect via UPI. Share screen using AnyDesk ID: XXXXXXX to complete process.",
        "scam_family": "UPI/Payment Scam", "year": 2022, "cluster_id": 2, "confidence_score": 0.91, "source_label": "WhatsApp"
    },
    {
        "text": "UPI mandate created for Rs 9,999. Accept mandate by entering PIN. For queries call 1800-XXXX. This is a payment authorization.",
        "scam_family": "UPI/Payment Scam", "year": 2022, "cluster_id": 2, "confidence_score": 0.88, "source_label": "SMS"
    },
    {
        "text": "Scan this QR code to receive Rs 500 cashback from PhonePe. Quick, offer expires in 10 minutes! [QR CODE IMAGE]",
        "scam_family": "UPI/Payment Scam", "year": 2023, "cluster_id": 2, "confidence_score": 0.90, "source_label": "WhatsApp"
    },
    {
        "text": "BHIM UPI: You have a pending collect request for Rs 15,000 from a merchant. Accept to complete your recent booking.",
        "scam_family": "UPI/Payment Scam", "year": 2023, "cluster_id": 2, "confidence_score": 0.87, "source_label": "SMS"
    },
    {
        "text": "Gas cylinder subsidy of Rs 300/month linked to your Aadhaar. To activate subsidy, share your UPI ID and enter OTP.",
        "scam_family": "UPI/Payment Scam", "year": 2023, "cluster_id": 2, "confidence_score": 0.85, "source_label": "WhatsApp"
    },
    {
        "text": "Your GPay account shows security risk. Tap the link to verify and avoid Rs 10,000 fraudulent transfer being processed.",
        "scam_family": "UPI/Payment Scam", "year": 2024, "cluster_id": 2, "confidence_score": 0.92, "source_label": "SMS"
    },
    {
        "text": "PM KISAN instalment of Rs 2,000 ready for disbursement. Register your UPI handle to receive payment within 24 hours.",
        "scam_family": "UPI/Payment Scam", "year": 2024, "cluster_id": 2, "confidence_score": 0.88, "source_label": "WhatsApp"
    },
    {
        "text": "Your UPI ID was used for a Rs 49,999 transaction. To cancel, open any UPI app and enter your PIN in the 'Dispute' section.",
        "scam_family": "UPI/Payment Scam", "year": 2024, "cluster_id": 2, "confidence_score": 0.91, "source_label": "SMS"
    },
    {
        "text": "Instant loan approved: Rs 50,000 disbursed to UPI linked account. Confirm receipt by entering MPIN. Validity: 15 minutes.",
        "scam_family": "UPI/Payment Scam", "year": 2025, "cluster_id": 2, "confidence_score": 0.90, "source_label": "SMS"
    },
    {
        "text": "Jio cashback Rs 399 is expiring. Redeem via UPI now. Enter your UPI PIN to transfer cashback to your Jio wallet.",
        "scam_family": "UPI/Payment Scam", "year": 2022, "cluster_id": 2, "confidence_score": 0.84, "source_label": "SMS"
    },
    {
        "text": "To sell your old phone on OLX, buyer requests a token payment of Rs 1 via UPI to verify your account is active.",
        "scam_family": "UPI/Payment Scam", "year": 2021, "cluster_id": 2, "confidence_score": 0.86, "source_label": "WhatsApp"
    },
    {
        "text": "NPCI UPI fraud alert: Unusual pattern detected. Temporarily freeze suspicious UPI transactions at upi-protect.in",
        "scam_family": "UPI/Payment Scam", "year": 2025, "cluster_id": 2, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "Your UPI autopay for Netflix is failing. Update payment details at netflix-upi-update.com to avoid service interruption.",
        "scam_family": "UPI/Payment Scam", "year": 2025, "cluster_id": 2, "confidence_score": 0.87, "source_label": "Email"
    },

    # ═══════════════════════════════════════════
    # PHISHING EMAIL  (cluster_id=3)  12 entries
    # Evolution: Password reset → Account verification → Crypto phishing
    # ═══════════════════════════════════════════
    {
        "text": "Your password has been compromised in a data breach. Reset your password immediately at secure-account-reset.com",
        "scam_family": "Phishing Email", "year": 2020, "cluster_id": 3, "confidence_score": 0.87, "source_label": "Email"
    },
    {
        "text": "Microsoft account alert: Your account will be suspended in 24 hours due to unusual sign-in activity. Verify at microsoft-secure.net",
        "scam_family": "Phishing Email", "year": 2021, "cluster_id": 3, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "Your Google account was accessed from a new device in Russia. Secure your account by clicking: accounts-google-security.com",
        "scam_family": "Phishing Email", "year": 2021, "cluster_id": 3, "confidence_score": 0.88, "source_label": "Email"
    },
    {
        "text": "Action required: Your Apple ID has been locked due to failed payment. Update billing details at apple-id-billing.com",
        "scam_family": "Phishing Email", "year": 2022, "cluster_id": 3, "confidence_score": 0.91, "source_label": "Email"
    },
    {
        "text": "Your PayPal account is limited. Please verify your identity by uploading a government-issued ID at paypal-verify-id.com",
        "scam_family": "Phishing Email", "year": 2022, "cluster_id": 3, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "Binance Security Notice: Suspicious withdrawal detected. Confirm or cancel at binance-secure-withdrawal.com within 1 hour.",
        "scam_family": "Phishing Email", "year": 2023, "cluster_id": 3, "confidence_score": 0.92, "source_label": "Email"
    },
    {
        "text": "Your MetaMask wallet requires re-authentication. Connect wallet at metamask-wallet-verify.io to prevent loss of funds.",
        "scam_family": "Phishing Email", "year": 2023, "cluster_id": 3, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "LinkedIn: Your account has been flagged for suspicious activity. Verify your email at linkedin-account-verify.com",
        "scam_family": "Phishing Email", "year": 2024, "cluster_id": 3, "confidence_score": 0.88, "source_label": "Email"
    },
    {
        "text": "IRCTC account locked due to multiple login failures. Re-activate your account to book tickets: irctc-account-unlock.com",
        "scam_family": "Phishing Email", "year": 2024, "cluster_id": 3, "confidence_score": 0.87, "source_label": "Email"
    },
    {
        "text": "ChatGPT Plus subscription failed: Update payment to continue premium access. secure-openai-billing.com",
        "scam_family": "Phishing Email", "year": 2024, "cluster_id": 3, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "Your Aadhaar-linked email requires re-verification for UIDAI compliance. Complete at uidai-email-verify.in",
        "scam_family": "Phishing Email", "year": 2025, "cluster_id": 3, "confidence_score": 0.90, "source_label": "Email"
    },
    {
        "text": "AI security scan detected malware on your device. Install our protection tool to remove threats: device-shield-pro.net",
        "scam_family": "Phishing Email", "year": 2025, "cluster_id": 3, "confidence_score": 0.88, "source_label": "Email"
    },

    # ═══════════════════════════════════════════
    # LOTTERY SCAM  (cluster_id=4)  10 entries
    # Evolution: Email lottery → WhatsApp prize → Crypto giveaway
    # ═══════════════════════════════════════════
    {
        "text": "CONGRATULATIONS! You have won £1,500,000 in the UK National Lottery. Your email was randomly selected. Claim at lottery-uk-prize.com",
        "scam_family": "Lottery Scam", "year": 2020, "cluster_id": 4, "confidence_score": 0.86, "source_label": "Email"
    },
    {
        "text": "You are the lucky winner of Rs 25 Lakh in KBC (Kaun Banega Crorepati). Contact our agent at +91-XXXXXXXXXX to claim your prize.",
        "scam_family": "Lottery Scam", "year": 2021, "cluster_id": 4, "confidence_score": 0.89, "source_label": "WhatsApp"
    },
    {
        "text": "Amazon Great Indian Festival: Your order number was selected for Rs 50,000 prize. Pay Rs 500 processing fee to claim.",
        "scam_family": "Lottery Scam", "year": 2022, "cluster_id": 4, "confidence_score": 0.87, "source_label": "SMS"
    },
    {
        "text": "Flipkart Big Billion Days winner: You have won a iPhone 14. Pay GST of Rs 1,800 to receive your free prize delivery.",
        "scam_family": "Lottery Scam", "year": 2022, "cluster_id": 4, "confidence_score": 0.91, "source_label": "WhatsApp"
    },
    {
        "text": "Elon Musk BTC Giveaway: Send 0.1 BTC and receive 0.5 BTC back. Limited time offer. Verified event: elonmusk-crypto-give.com",
        "scam_family": "Lottery Scam", "year": 2023, "cluster_id": 4, "confidence_score": 0.93, "source_label": "Twitter/X"
    },
    {
        "text": "You have been selected for the 5G SIM upgrade lottery. Win Rs 10 Lakh. Fill your details at 5g-lottery-india.com",
        "scam_family": "Lottery Scam", "year": 2023, "cluster_id": 4, "confidence_score": 0.88, "source_label": "SMS"
    },
    {
        "text": "WazirX crypto airdrop: Your wallet has been selected to receive 1000 WRX tokens. Connect wallet at wazirx-airdrop.io to claim.",
        "scam_family": "Lottery Scam", "year": 2024, "cluster_id": 4, "confidence_score": 0.90, "source_label": "Telegram"
    },
    {
        "text": "PM Awas Yojana Lottery: Your Aadhaar was selected for Rs 2,50,000 housing subsidy. Claim at pmay-lottery-official.in",
        "scam_family": "Lottery Scam", "year": 2024, "cluster_id": 4, "confidence_score": 0.87, "source_label": "WhatsApp"
    },
    {
        "text": "Apple Vision Pro lucky draw winner! You won a free unit. Pay import duty of Rs 5,000 for delivery. Verify at apple-india-draw.com",
        "scam_family": "Lottery Scam", "year": 2024, "cluster_id": 4, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "AI-selected lucky draw: Your unique browsing ID has won a Rs 1 Crore scholarship. Claim at ai-scholarship-india.in",
        "scam_family": "Lottery Scam", "year": 2025, "cluster_id": 4, "confidence_score": 0.88, "source_label": "Browser popup"
    },

    # ═══════════════════════════════════════════
    # LOAN SCAM  (cluster_id=5)  10 entries
    # Evolution: Instant personal loan → Low-CIBIL loan → Fake government scheme
    # ═══════════════════════════════════════════
    {
        "text": "Instant personal loan approved: Rs 5 Lakh at 2% interest. No documents required. Pay Rs 2,500 processing fee via UPI.",
        "scam_family": "Loan Scam", "year": 2021, "cluster_id": 5, "confidence_score": 0.87, "source_label": "SMS"
    },
    {
        "text": "Low CIBIL score? No problem. We offer loans up to Rs 10 Lakh regardless of credit score. Apply fee: Rs 1,999.",
        "scam_family": "Loan Scam", "year": 2022, "cluster_id": 5, "confidence_score": 0.89, "source_label": "WhatsApp"
    },
    {
        "text": "Pre-approved home loan of Rs 30 Lakh at 6.5% interest. Pay Rs 5,000 documentation charge to process your application today.",
        "scam_family": "Loan Scam", "year": 2022, "cluster_id": 5, "confidence_score": 0.86, "source_label": "SMS"
    },
    {
        "text": "PM Mudra Loan for small businesses: Rs 10 Lakh at 4% interest. Registration fee Rs 3,500 for government portal access.",
        "scam_family": "Loan Scam", "year": 2023, "cluster_id": 5, "confidence_score": 0.91, "source_label": "WhatsApp"
    },
    {
        "text": "Education loan for abroad studies: Rs 50 Lakh at lowest rates. Deposit Rs 10,000 refundable security to get loan offer letter.",
        "scam_family": "Loan Scam", "year": 2023, "cluster_id": 5, "confidence_score": 0.88, "source_label": "Email"
    },
    {
        "text": "Gold loan at 0% interest for 6 months. Pledge gold from home, loan disbursed in 2 hours. Registration: Rs 999.",
        "scam_family": "Loan Scam", "year": 2024, "cluster_id": 5, "confidence_score": 0.87, "source_label": "SMS"
    },
    {
        "text": "Crypto-backed loan approved: $10,000 USDT loan. Transfer 0.01 ETH as collateral to smart contract to receive funds.",
        "scam_family": "Loan Scam", "year": 2024, "cluster_id": 5, "confidence_score": 0.90, "source_label": "Telegram"
    },
    {
        "text": "RBI-approved emergency loan scheme: Rs 2 Lakh at 0% for 12 months. Apply by paying Rs 4,000 GST to government portal.",
        "scam_family": "Loan Scam", "year": 2025, "cluster_id": 5, "confidence_score": 0.92, "source_label": "WhatsApp"
    },
    {
        "text": "Your loan application Rs 8 Lakh is approved. To disburse to your account, submit 2 post-dated cheques and pay Rs 6,500.",
        "scam_family": "Loan Scam", "year": 2025, "cluster_id": 5, "confidence_score": 0.89, "source_label": "Email"
    },
    {
        "text": "MSME loan without collateral: Rs 25 Lakh instantly. AI credit scoring used. Pay Rs 7,500 insurance premium to activate loan.",
        "scam_family": "Loan Scam", "year": 2025, "cluster_id": 5, "confidence_score": 0.88, "source_label": "Email"
    },
]


def seed_qdrant(qdrant_svc: "QdrantService", embedding_svc: "EmbeddingService") -> None:
    """
    Idempotent seeding: skips if Qdrant already has data.
    Seeds scam_messages collection, then computes family centroids for scam_families.
    """
    existing_count = qdrant_svc.get_total_count()
    if existing_count > 0:
        logger.info("Qdrant already seeded (%d messages). Skipping.", existing_count)
        return

    logger.info("Seeding Qdrant with %d scam messages...", len(SEED_DATA))

    # ── Embed all texts in a single batch pass ────────────────────────────────
    texts = [entry["text"] for entry in SEED_DATA]
    vectors = embedding_svc.encode_batch(texts)

    # ── Upsert messages ────────────────────────────────────────────────────────
    timestamp = datetime.now(timezone.utc).isoformat()
    batch: list[tuple] = []
    family_vectors: dict[str, list[list[float]]] = {}

    for entry, vector in zip(SEED_DATA, vectors):
        point_id = uuid.uuid4()
        payload = {
            "message_text": entry["text"],
            "scam_family": entry["scam_family"],
            "year": entry["year"],
            "cluster_id": entry["cluster_id"],
            "confidence_score": entry["confidence_score"],
            "modality": "text",
            "source_label": entry.get("source_label", "Unknown"),
            "timestamp": timestamp,
        }
        batch.append((point_id, vector, payload))
        family_vectors.setdefault(entry["scam_family"], []).append(vector)

    qdrant_svc.upsert_messages_batch(batch)
    logger.info("Upserted %d scam messages.", len(batch))

    # ── Compute and store normalized family centroids ─────────────────────────
    for family, vecs in family_vectors.items():
        centroid = np.mean(np.array(vecs), axis=0)
        norm = np.linalg.norm(centroid)
        if norm > 0:
            centroid = centroid / norm
        qdrant_svc.upsert_family_centroid(family, centroid.tolist(), len(vecs))

    logger.info(
        "Seeding complete: %d messages, %d family centroids.",
        len(batch),
        len(family_vectors),
    )
