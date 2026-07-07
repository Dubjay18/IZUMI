> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Try the API

> Test Nomba APIs instantly — no account or credentials required

<Tip>
  No sign-up needed. Call the sandbox endpoints below directly — skip the `Authorization` header and `accountId` entirely. This is the fastest way to see Nomba APIs in action.
</Tip>

All examples on this page point to `https://sandbox.nomba.com`. No real money moves — it's a fully isolated test environment.

***

## Option 1 — Try it directly in the API Reference

The quickest way to test with zero setup. No terminal, no code.

<Steps>
  <Step title="Go to the API Reference">
    Navigate to the [API Reference](/nomba-api-reference/introduction) section in the sidebar, then pick any endpoint — for example [Transfer](/nomba-api-reference/transfers/perform-bank-account-transfer-from-the-parent-account), [Create Virtual Account](/nomba-api-reference/virtual-accounts/create-virtual-account), or [Create Checkout Order](/nomba-api-reference/online-checkout/create-an-online-checkout-order).
  </Step>

  <Step title="Click 'Try it'">
    On the endpoint page, click the **Try it** button to open the interactive request panel.
  </Step>

  <Step title="Select Sandbox from the base URL dropdown">
    At the top of the request panel, open the base URL dropdown and select **Sandbox** (`https://sandbox.nomba.com`).
  </Step>

  <Step title="Leave the auth fields blank">
    You will see fields for **Bearer Token** and **accountId** — leave both completely empty. You do not need credentials to test.
  </Step>

  <Step title="Fill in the request body and send">
    Enter your request body fields and click **Send**. The live response will appear directly on the page.
  </Step>
</Steps>

<Note>
  The API Reference playground sends requests directly to `https://sandbox.nomba.com`. Leaving the auth fields empty is intentional — it is how the no-account test mode works.
</Note>

***

## Option 2 — Run it from your terminal

## Transfer to a bank account

Send money to any Nigerian bank account.

<CodeGroup>
  ```bash cURL theme={null}
  curl --request POST \
    --url https://sandbox.nomba.com/v2/transfers/bank \
    --header 'Content-Type: application/json' \
    --data '{
      "amount": 3500,
      "accountNumber": "055472814",
      "accountName": "M.A Animashaun",
      "bankCode": "058",
      "merchantTxRef": "UNQ_test_001",
      "senderName": "Test Sender",
      "narration": "Test transfer"
    }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://sandbox.nomba.com/v2/transfers/bank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 3500,
      accountNumber: '055472814',
      accountName: 'M.A Animashaun',
      bankCode: '058',
      merchantTxRef: 'UNQ_test_001',
      senderName: 'Test Sender',
      narration: 'Test transfer',
    }),
  });
  const data = await response.json();
  console.log(data);
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://sandbox.nomba.com/v2/transfers/bank',
      headers={'Content-Type': 'application/json'},
      json={
          'amount': 3500,
          'accountNumber': '055472814',
          'accountName': 'M.A Animashaun',
          'bankCode': '058',
          'merchantTxRef': 'UNQ_test_001',
          'senderName': 'Test Sender',
          'narration': 'Test transfer',
      },
  )
  print(response.json())
  ```
</CodeGroup>

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "id": "txn_abc123",
    "status": "SUCCESS",
    "amount": 3500,
    "accountNumber": "055472814",
    "bankCode": "058",
    "merchantTxRef": "UNQ_test_001"
  }
}
```

***

## Create a virtual account

Generate a unique account number to receive payments.

<CodeGroup>
  ```bash cURL theme={null}
  curl --request POST \
    --url https://sandbox.nomba.com/v1/accounts/virtual \
    --header 'Content-Type: application/json' \
    --data '{
      "accountRef": "ref_test_001",
      "accountName": "John Doe",
      "currency": "NGN"
    }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://sandbox.nomba.com/v1/accounts/virtual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountRef: 'ref_test_001',
      accountName: 'John Doe',
      currency: 'NGN',
    }),
  });
  const data = await response.json();
  console.log(data);
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://sandbox.nomba.com/v1/accounts/virtual',
      headers={'Content-Type': 'application/json'},
      json={
          'accountRef': 'ref_test_001',
          'accountName': 'John Doe',
          'currency': 'NGN',
      },
  )
  print(response.json())
  ```
</CodeGroup>

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "accountNumber": "9900012345",
    "accountName": "John Doe",
    "bankName": "Nomba",
    "bankCode": "000026",
    "accountRef": "ref_test_001",
    "currency": "NGN"
  }
}
```

***

## Create a checkout order

Generate a payment link your customers can use to pay.

<CodeGroup>
  ```bash cURL theme={null}
  curl --request POST \
    --url https://sandbox.nomba.com/v1/checkout/order \
    --header 'Content-Type: application/json' \
    --data '{
      "order": {
        "orderReference": "order_test_001",
        "amount": "10000.00",
        "currency": "NGN",
        "customerEmail": "test@example.com",
        "callbackUrl": "https://merchant.com/callback"
      }
    }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://sandbox.nomba.com/v1/checkout/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order: {
        orderReference: 'order_test_001',
        amount: '10000.00',
        currency: 'NGN',
        customerEmail: 'test@example.com',
        callbackUrl: 'https://merchant.com/callback',
      },
    }),
  });
  const data = await response.json();
  console.log(data);
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://sandbox.nomba.com/v1/checkout/order',
      headers={'Content-Type': 'application/json'},
      json={
          'order': {
              'orderReference': 'order_test_001',
              'amount': '10000.00',
              'currency': 'NGN',
              'customerEmail': 'test@example.com',
              'callbackUrl': 'https://merchant.com/callback',
          }
      },
  )
  print(response.json())
  ```
</CodeGroup>

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "checkoutLink": "https://checkout.nomba.com/sandbox/<encrypted-ref>",
    "orderReference": "order_test_001"
  }
}
```

Open the `checkoutLink` in your browser to see the full payment UI. Use the [test cards](/docs/products/accept-payment/sandbox-testing#test-card-numbers) to simulate different payment outcomes.

***

## Ready to go further?

Once you've explored the sandbox, create a free Nomba account to get your own credentials and go live.

<CardGroup cols={2}>
  <Card title="Create an account" icon="user-plus" href="https://dashboard.nomba.com/signup">
    Get your API keys and start building in minutes.
  </Card>

  <Card title="Full sandbox guide" icon="flask" href="/docs/products/accept-payment/sandbox-testing">
    Test cards, webhooks, and error simulation for Checkout.
  </Card>

  <Card title="Authentication" icon="shield-check" href="/docs/getting-started/authentication">
    Learn how bearer tokens and accountId work.
  </Card>

  <Card title="API Reference" icon="code" href="/nomba-api-reference/introduction">
    Browse all available endpoints.
  </Card>
</CardGroup>


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Testing

> Test your Nomba Checkout integration end-to-end in the sandbox environment

<Warning>
  All sandbox API calls must use the base URL `https://sandbox.nomba.com` **and** your sandbox credentials. Mixing production credentials with the sandbox URL (or vice versa) will cause authentication errors. See [Environment](/docs/api-basics/environment) for details.
</Warning>

## Before you start

### Get your sandbox credentials

Log in to the [Nomba dashboard](https://dashboard.nomba.com), navigate to **API Keys**, and copy your **test** `clientId`, `clientSecret`, and `accountId`. These are generated alongside your production credentials and only work with `https://sandbox.nomba.com`.

### Generate a sandbox access token

Exchange your test credentials for an access token. The sandbox token is short-lived — if you get `401` errors mid-test, generate a new one.

```bash theme={null}
curl --request POST \
  --url https://sandbox.nomba.com/v1/auth/token/issue \
  --header 'Content-Type: application/json' \
  --header 'accountId: <your-sandbox-accountId>' \
  --data '{
    "grant_type": "client_credentials",
    "client_id": "<your-sandbox-clientId>",
    "client_secret": "<your-sandbox-clientSecret>"
  }'
```

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "01h4gdx2...",
    "expiresAt": "2026-01-01T12:00:00Z"
  }
}
```

<Note>
  All sandbox checkout endpoints are under the `/sandbox/checkout/` path prefix, not `/v1/checkout/`. This is the key difference between sandbox and production.
</Note>

***

## Card payment flow

### Step 1 — Create a checkout order

```bash theme={null}
curl --request POST \
  --url https://sandbox.nomba.com/sandbox/checkout/order \
  --header 'Authorization: Bearer <sandbox-token>' \
  --header 'Content-Type: application/json' \
  --header 'accountId: <your-sandbox-accountId>' \
  --data '{
    "order": {
      "orderReference": "test-order-001",
      "amount": "400000.00",
      "currency": "NGN",
      "customerEmail": "test@example.com",
      "callbackUrl": "https://merchant.com/callback"
    }
  }'
```

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "checkoutLink": "https://checkout.nomba.com/sandbox/<encrypted-ref>",
    "orderReference": "test-order-001"
  }
}
```

<Note>
  If you omit `orderReference`, Nomba generates one in the format `{accountId_prefix}_{timestamp}` and returns it in the response. Use that value for all subsequent calls.
</Note>

The sandbox checkout link has the format `https://checkout.nomba.com/sandbox/{encryptedRef}` — note the `/sandbox/` segment, which distinguishes it from production links.

Orders and their data are stored for **48 hours** before expiring.

***

### Step 2 — Submit card details

Submit the test card details to the checkout. The response depends entirely on which card number you use.

<Frame caption="Submit Card with Detail Form">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/send-card-details.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=787bbb3a4da8273c2e1600e6775a6c1b" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="652" data-path="images/send-card-details.png" />
</Frame>

### Test card numbers

Use one of these three cards to simulate different payment outcomes:

| Card Number        | Network    | Outcome                                   | Next step                        |
| ------------------ | ---------- | ----------------------------------------- | -------------------------------- |
| `5434621074252808` | Mastercard | OTP required (T0 response)                | Submit OTP to complete           |
| `4000000000002503` | Visa       | 3DS authentication required (S0 response) | Handle 3DS redirect              |
| `5484497218317651` | Mastercard | Declined — "do not honor"                 | No further steps; payment failed |

<Note>
  Card expiry, CVV, and PIN values are not validated in the sandbox — any values are accepted. Only the card number determines the outcome.
</Note>

<Frame caption="Submit Card Detail Form">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/submit-card-with-details.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=a23aa7b7e965633d35b717c715ad2c79" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="652" data-path="images/submit-card-with-details.png" />
</Frame>

### Step 3 - Submit Card Pin (if required)

Enter `1234` as the card pin

<Frame caption="Submit Card Detail Form">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/submit-card-pin.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=c53dc0ce85b145f507bb3c0953da5fad" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="652" data-path="images/submit-card-pin.png" />
</Frame>

**Declined card (5484497218317651) response:**

<Frame caption="Submit Card Detail for Failed Transaction">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/submit-card-failed-transaction.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=63b3bce31d7e94907d25b8bb317ec4e2" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="547" data-path="images/submit-card-failed-transaction.png" />
</Frame>

***

### Step 4 — Submit OTP

After submitting the successful Mastercard (`5434621074252808`), the customer is prompted for an OTP. Submit one of the following test values to control the outcome:

| OTP    | Outcome     | Message                                              |
| ------ | ----------- | ---------------------------------------------------- |
| `9999` | Approved    | "Approved by Financial Institution"                  |
| `1234` | Timeout     | "Your payment has exceeded the time required to pay" |
| `5464` | Invalid OTP | "Invalid OTP"                                        |

<Frame caption="Submit Card Detail Form">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/submit-card-otp.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=4c516f5ac5278c8252a058fe4ce9cd04" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="652" data-path="images/submit-card-otp.png" />
</Frame>

**Successful card (5434621074252808) response:**

<Frame caption="Submit Card Detail Form">
  <img src="https://mintcdn.com/nombainc/wNlVYooLvkeLeMVC/images/submit-card-details-successful.png?fit=max&auto=format&n=wNlVYooLvkeLeMVC&q=85&s=5fcb05e0cdc3bd827b71c0a75df2ca5a" style={{ borderRadius: '0.5rem' }} loading="lazy" width="714" height="673" data-path="images/submit-card-details-successful.png" />
</Frame>

On a successful OTP submission, Nomba **immediately fires a webhook** to your configured `callbackUrl` with a `payment_success` event. See [Webhook payload](#webhook-payload) below.

***

### Step 4 — Verify the transaction

Use the sandbox-specific fetch endpoint to confirm the transaction result:

```bash theme={null}
curl --request GET \
  --url 'https://sandbox.nomba.com/sandbox/checkout/transaction?idType=orderReference&id=test-order-001' \
  --header 'Authorization: Bearer <sandbox-token>' \
  --header 'accountId: <your-sandbox-accountId>'
```

```json Response theme={null}
{
  "code": "00",
  "description": "Success",
  "data": {
    "success": true,
    "message": "PAYMENT SUCCESSFUL",
    "order": {
      "orderId": "a1b2c3d4-e5f6-47a8-xxxx-xxxxxxxxxxxx",
      "orderReference": "test-order-001",
      "amount": "4000.00",
      "currency": "NGN",
      "customerEmail": "test@example.com"
    },
    "transactionDetails": {
      "transactionDate": "2026-03-31T10:00:00Z",
      "paymentReference": "WEB-ONLINE_C-abc123-550e4c3a-...",
      "statusCode": "PAYMENT SUCCESSFUL",
      "tokenizedCardPayment": "false"
    },
    "cardDetails": {
      "cardPan": "543462 **** **** 2808",
      "cardType": "MASTERCARD",
      "cardCurrency": "NGN"
    }
  }
}
```

You can query by `idType=orderReference` or `idType=orderId`. The `id` value changes accordingly.

<Note>
  The sandbox transaction fetch endpoint is `GET /sandbox/checkout/transaction` — not `GET /v1/checkout/transaction`, which is production-only. Transaction IDs in the sandbox follow the format `WEB-ONLINE_C-{first6charsOfAccountId}-{UUID}`.
</Note>

***

## Webhook payload

The sandbox fires webhooks **synchronously** immediately after a successful transaction — either after OTP approval (card) or `confirm-transaction-receipt` (bank transfer). Webhooks include HMAC-SHA256 signature headers for verification.

**Signature headers:**

| Header                      | Description                          |
| --------------------------- | ------------------------------------ |
| `nomba-signature`           | HMAC-SHA256 signature of the payload |
| `nomba-sig-value`           | Raw signature value                  |
| `nomba-signature-algorithm` | Always `HmacSHA256`                  |
| `nomba-timestamp`           | ISO 8601 UTC timestamp of the event  |

**Sample card payment webhook payload:**

```json theme={null}
{
  "event_type": "payment_success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "merchant": {
      "userId": "<your-accountId>"
    },
    "transaction": {
      "fee": 0.28,
      "type": "online_checkout",
      "transactionId": "WEB-ONLINE_C-abc123-550e4c3a-0af4-4887-a089-xxxx",
      "merchantTxRef": "txref-1743379200",
      "transactionAmount": 4000.00,
      "time": "2026-03-31T10:00:00Z"
    },
    "order": {
      "amount": 4000.00,
      "orderId": "a1b2c3d4-e5f6-47a8-xxxx-xxxxxxxxxxxx",
      "accountId": "<your-accountId>",
      "customerEmail": "test@example.com",
      "orderReference": "test-order-001",
      "paymentMethod": "card_payment",
      "currency": "NGN"
    }
  }
}
```

To receive webhooks during local development, use a tunnel tool (e.g. [ngrok](https://ngrok.com)) to expose your local server and set the public URL as your `callbackUrl` when creating the order.

***

## Refund testing

Refunds are available in the sandbox. Use `POST /sandbox/checkout/refund` with the `transactionId` from the fetch transaction response.

```bash theme={null}
curl --request POST \
  --url https://sandbox.nomba.com/sandbox/checkout/refund \
  --header 'Authorization: Bearer <sandbox-token>' \
  --header 'Content-Type: application/json' \
  --header 'accountId: <your-sandbox-accountId>' \
  --data '{
    "transactionId": "WEB-ONLINE_C-abc123-550e4c3a-...",
    "amount": 4000.00
  }'
```

To simulate a **failed refund**, use this specific `transactionId`:

```
WEB-ONLINE_C-97922-db88d4c3-a0af-4887-a089-b5d2e51b8f19
```

This always returns `code: "400"` regardless of the amount.

***

## Simulating error states

| What to test                | How to trigger                                                              |
| --------------------------- | --------------------------------------------------------------------------- |
| Order not found             | Use `orderReference: "1234567890"` — returns `404` on all endpoints         |
| Card declined               | Use card `5484497218317651`                                                 |
| OTP timeout                 | Submit OTP `1234`                                                           |
| Invalid OTP                 | Submit OTP `5464`                                                           |
| Failed refund               | Use transactionId `WEB-ONLINE_C-97922-db88d4c3-a0af-4887-a089-b5d2e51b8f19` |
| Failed tokenized card fetch | Use `customerEmail: "test@test.com"`                                        |

***

## Sandbox vs production — what's different

| Feature                | Sandbox                             | Production                     |
| ---------------------- | ----------------------------------- | ------------------------------ |
| Base path for checkout | `/sandbox/checkout/`                | `/v1/checkout/`                |
| Create order           | ✅                                   | ✅                              |
| Card payment           | ✅ Test cards only                   | ✅ Real cards                   |
| Bank transfer          | ✅ Simulated                         | ✅ Real transfers               |
| 3DS authentication     | ✅ Simulated                         | ✅ Real                         |
| Webhooks               | ✅ Fires synchronously               | ✅ Queued delivery              |
| Fetch transaction      | `GET /sandbox/checkout/transaction` | `GET /v1/checkout/transaction` |
| Refund                 | ✅                                   | ✅                              |
| Cancel order           | ✅                                   | ✅                              |
| Tokenized cards        | ✅ Hardcoded mock data               | ✅ Real tokens                  |
| Real card validation   | ❌ Card number determines outcome    | ✅                              |
| Data persistence       | Redis, expires after 48 hours       | Permanent                      |

***

## Next steps

<CardGroup cols={2}>
  <Card title="Create a Checkout Order" icon="cart-plus" href="/docs/products/accept-payment/create-checkout-order">
    Full field reference and production code examples
  </Card>

  <Card title="Verify Transactions" icon="magnifying-glass" href="/docs/products/accept-payment/verify-transactions">
    Confirm payment status before delivering value
  </Card>

  <Card title="Webhooks" icon="webhook" href="/docs/api-basics/webhook">
    Set up and verify webhook signatures
  </Card>

  <Card title="Environment" icon="seedling" href="/docs/api-basics/environment">
    Understand sandbox vs production base URLs
  </Card>
</CardGroup>


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify Transactions

> Learn how to verify checkout transactions using the Nomba API

<CardGroup cols={2}>
  <Card title="Verify by Order Reference" icon="magnifying-glass" href="/nomba-api-reference/transactions/filter-parent-account-transactions">
    Look up a transaction using your order reference or the Nomba transaction ID.
  </Card>

  <Card title="Fetch Checkout Transaction (Production)" icon="file-invoice-dollar" href="/nomba-api-reference/online-checkout/fetch-checkout-transaction">
    Retrieve full checkout order details including card and transfer info.
  </Card>
</CardGroup>

## Which endpoint should I use?

There are two ways to verify a checkout transaction. Choose based on your environment and what you need:

| Endpoint                           | Method | Environment          | Use when                                                                                                                              |
| ---------------------------------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/transactions/accounts/single` | GET    | Sandbox + Production | You want to confirm `status: SUCCESS` before delivering value. Works with both `orderReference` and `transactionRef` as query params. |
| `/v1/checkout/transaction`         | GET    | **Production only**  | You need full checkout order details (card info, transfer details, order metadata).                                                   |

<Tip>
  Always verify transactions before providing goods or services to your customer — even if you received a webhook.
</Tip>

## Option 1: Verify via `/v1/transactions/accounts/single`

This endpoint works in both sandbox and production. Pass the `orderReference` (the reference on the order) or the `transactionRef` (the Nomba transaction ID from the webhook) as a query parameter.

The key field to check in the response is `data.status`. A successful payment returns `"status": "SUCCESS"`.

<CodeGroup>
  ```bash Verify by orderReference theme={null}
    curl --request GET \
      --url 'https://api.nomba.com/v1/transactions/accounts/single?orderReference=90e81e8a-bc14-4ebf-89c0-57da801cca68' \
      --header 'Authorization: Bearer <token>' \
      --header 'accountId: <accountid>'
  ```

  ```bash Verify by transactionRef theme={null}
    curl --request GET \
      --url 'https://api.nomba.com/v1/transactions/accounts/single?transactionRef=WEB-ONLINE_C-69923-ae0f2688-12b1-45b6-9972-06261aa65ef1' \
      --header 'Authorization: Bearer <token>' \
      --header 'accountId: <accountid>'
  ```

  ```javascript Node.js theme={null}
  // Verify by orderReference
  const orderReference = '90e81e8a-bc14-4ebf-89c0-57da801cca68';
  const url = new URL('https://api.nomba.com/v1/transactions/accounts/single');
  url.searchParams.set('orderReference', orderReference);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accountId': accountId,
    },
  });

  const { code, data } = await response.json();
  if (code !== '00') throw new Error('Transaction not found');

  if (data.status === 'SUCCESS') {
    // Payment confirmed — deliver goods/services
  }
  ```

  ```python Python theme={null}
  import requests

  order_reference = '90e81e8a-bc14-4ebf-89c0-57da801cca68'

  response = requests.get(
      'https://api.nomba.com/v1/transactions/accounts/single',
      headers={
          'Authorization': f'Bearer {access_token}',
          'accountId': account_id,
      },
      params={'orderReference': order_reference},
  )

  result = response.json()
  if result['code'] != '00':
      raise Exception('Transaction not found')

  if result['data']['status'] == 'SUCCESS':
      pass  # Payment confirmed — deliver goods/services
  ```

  ```json expandable Response (Success) theme={null}
  {
    "code": "00",
    "description": "SUCCESS",
    "data": {
        "id": "WEB-ONLINE_C-69923-ae0f2688-12b1-45b6-9972-06261aa65ef1",
        "status": "SUCCESS",
        "amount": "202.8",
        "fixedCharge": "2.8",
        "source": "web",
        "type": "online_checkout",
        "gatewayMessage": "PAYMENT SUCCESSFUL",
        "customerBillerId": "7373019705",
        "timeCreated": "2025-09-26T01:07:02.729Z",
        "timeUpdated": "2025-09-26T01:07:02.989Z",
        "walletCurrency": "NGN",
        "walletBalance": "478.97",
        "billingVendorReference": "68d5e736e414b032b3******",
        "paymentVendorReference": "09064525092601065923059812******",
        "userId": "69923f4d-963f-4a2b-b0f5-4da074d0a461",
        "onlineCheckoutOrderId": "9adcbf44-8cca-4fc6-b3a7-ac2758******",
        "onlineCheckoutOrderReference": "90e81e8a-bc14-4ebf-89c0-57da801c******",
        "onlineCheckoutCurrency": "NGN",
        "onlineCheckoutCustomerEmail": "make@gmail.com",
        "currency": "NGN",
        "onlineCheckoutAmount": "202.8",
        "onlineCheckoutPaymentMethod": "bank_transfer",
        "entryType": "CREDIT"
    }
  }
  ```

  ```json Response (Failed / Not Found) theme={null}
  {
    "code": "01",
    "description": "Transaction not found",
    "data": null
  }
  ```
</CodeGroup>

<Note>
  For sandbox transactions, use the sandbox base URL: `https://sandbox.nomba.com/v1/transactions/accounts/single`. See [Sandbox Testing](/docs/products/accept-payment/sandbox-testing) for details on looking up sandbox transactions.
</Note>

## Option 2: Get Checkout Transaction (Production only)

This endpoint returns full checkout order details including card information, transfer details, and order metadata. It is useful when you need richer data than the basic transaction lookup provides — for example, to display order details on a receipt page.

<Warning>
  This endpoint is only available in the **production** environment. For sandbox verification, use `POST /v1/transactions/accounts` with the transaction reference — see [Sandbox Testing](/docs/products/accept-payment/sandbox-testing).
</Warning>

To fetch a checkout transaction, send a [GET request](/nomba-api-reference/online-checkout/fetch-checkout-transaction) to this endpoint `/v1/checkout/transaction`.

<CodeGroup>
  ```bash Request theme={null}
    curl --request GET \
      --url 'https://api.nomba.com/v1/checkout/transaction?idType=ORDER_REFERENCE&id=68da39e0-2ce4-4ea6-9def-5*********' \
      --header 'Authorization: Bearer <token>' \
      --header 'accountId: <accountid>'
  ```

  ```json Response theme={null}
    {
      "code": "00",
      "description": "Success",
      "data": {
        "success": "true",
        "message": "success",
        "order": {
          "orderId": "56e03654-0c32-4d3e-bbd6-a9df22994a12",
          "orderReference": "90e81e8a-bc14-4ebf-89c0-57da752cca58",
          "customerId": "762878332454",
          "accountId": "56e03654-0c32-4d3e-bbd6-a9df22994a12",
          "callbackUrl": "https://ip:port/merchant.com/callback",
          "customerEmail": "abcde@gmail.com",
          "amount": "10000.00",
          "currency": "NGN"
        },
        "transactionDetails": {
          "transactionDate": "2023-12-06T15:46:43.000Z",
          "paymentReference": "5844858382134",
          "paymentVendorReference": "5844858382675493",
          "tokenizedCardPayment": "true",
          "statusCode": "Payment approved"
        },
        "transferDetails": {
          "sessionId": "67584432178569543",
          "beneficiaryAccountName": "Tope Fade",
          "beneficiaryAccountNumber": "5844858382",
          "originatorAccountName": "Femi Fash",
          "originatorAccountNumber": "3409082834",
          "narration": "Checkout payment",
          "destinationInstitutionCode": "true",
          "paymentReference": "44384586756"
        },
        "cardDetails": {
          "cardPan": "515123 **** **** 6667",
          "cardType": "Verve",
          "cardCurrency": "NGN",
          "cardBank": "057"
        }
      }
    }
  ```
</CodeGroup>


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Environment

> Learn about the production and sandbox environment

The Nomba API operates within two distinct environments: the production environment (LIVE) and the sandbox environment. These environments serve different purposes and require specific credentials for interaction.

## Base URLs

| Environment | Base URL                    | Purpose                       |
| ----------- | --------------------------- | ----------------------------- |
| Production  | `https://api.nomba.com`     | Live transactions, real money |
| Sandbox     | `https://sandbox.nomba.com` | Development and testing       |

<Warning>
  The base URL and credentials must always be paired to match the same environment. Using sandbox credentials with `api.nomba.com`, or production credentials with `sandbox.nomba.com`, will result in authentication errors.
</Warning>

## Credentials

<Frame caption="Production/Sandbox Keys">
  <img src="https://mintcdn.com/nombainc/VJp6uGRaVI4ms-qk/images/environment-1.png?fit=max&auto=format&n=VJp6uGRaVI4ms-qk&q=85&s=9fcdc704abbff7f5ed2f396bbddfdd78" style={{ borderRadius: '0.5rem' }} loading="lazy" width="3840" height="2914" data-path="images/environment-1.png" />
</Frame>

When you create an API key on the Nomba dashboard, both production and sandbox credential pairs (`clientId` + `clientSecret`) are generated at the same time. They are separate — sandbox credentials only work with the sandbox base URL, and production credentials only work with the production base URL.

## Production

When using the production environment, your interactions directly affect the live system. Real transactions are processed and real money moves. Always use `https://api.nomba.com` with your production `clientId` and `clientSecret`.

## Sandbox

The sandbox is an isolated environment for development and testing. Transactions do not affect your live account or move real funds.

<Note>
  Transactions conducted in the sandbox environment do not impact the production environment.
</Note>

To make a sandbox API call, use `https://sandbox.nomba.com` with your **test credentials** from the dashboard. Here is a sample sandbox authentication request:

```bash theme={null}
curl --request POST \
  --url https://sandbox.nomba.com/v1/auth/token/issue \
  --header 'Content-Type: application/json' \
  --header 'accountId: <your-sandbox-accountId>' \
  --data '{
    "grant_type": "client_credentials",
    "client_id": "<your-sandbox-clientId>",
    "client_secret": "<your-sandbox-clientSecret>"
  }'
```

The sandbox returns simulated responses that mirror production behaviour. Data in the sandbox is isolated and does not appear on your live dashboard. See the [Testing](/docs/api-basics/testing) page for test card details and transaction scenarios.


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Testing

> Learn about the test cards we use for testing purposes

<Warning>
  To use the sandbox environment, you must generate a token using your **test credentials** (`clientId` and `clientSecret` from the dashboard) and the **sandbox base URL** (`https://sandbox.nomba.com`). Using the wrong URL or credentials will cause authentication failures. See the [Environment](/docs/api-basics/environment) page for details.
</Warning>

<Info>
  Test cards are provided for use in the sandbox environment only. They cannot be used for real transactions and should not be used in production.
</Info>

## Test Card Details

Use the following card details when testing transactions in a sandbox or staging environment.

### Test cards

| Card Number           | Network    | Outcome                     |
| --------------------- | ---------- | --------------------------- |
| `5434 6210 7425 2808` | Mastercard | OTP required → approved     |
| `4000 0000 0000 2503` | Visa       | 3DS authentication required |
| `5484 4972 1831 7651` | Mastercard | Declined — "do not honor"   |

For all cards: CVV and expiry are not validated — any 3-digit CVV and any future expiry date are accepted. The card number alone determines the outcome.

### PIN and OTP

| Field          | Value  | Notes                                  |
| -------------- | ------ | -------------------------------------- |
| Card PIN       | `9999` | Used during card detail submission     |
| OTP — Approved | `9999` | Payment succeeds                       |
| OTP — Timeout  | `1234` | Payment fails with timeout message     |
| OTP — Invalid  | `5464` | Payment fails with invalid OTP message |

### Transaction scenarios

| Scenario                | How to trigger                          | Expected outcome     |
| ----------------------- | --------------------------------------- | -------------------- |
| Successful card payment | Card `5434 6210 7425 2808` + OTP `9999` | Transaction Approved |
| Declined card           | Card `5484 4972 1831 7651`              | do not honor         |
| OTP timeout             | OTP `1234`                              | Payment timed out    |
| Invalid OTP             | OTP `5464`                              | Invalid OTP          |
| Insufficient funds      | Amount greater than `500,000`           | Transaction Declined |
| Expired card            | Expiry `12/20`                          | Transaction Declined |

<Warning>
  This test card should only be used in development or staging environments. Do not attempt real transactions with this card.
</Warning>

## Quick Sandbox Flow

Follow these steps to run a checkout transaction end-to-end in the sandbox:

1. **Generate a sandbox token** — Use `https://sandbox.nomba.com/v1/auth/token/issue` with your test `clientId` and `clientSecret`
2. **Create a checkout order** — `POST https://sandbox.nomba.com/v1/checkout/order` with your sandbox token
3. **Open the checkout link** — Load the `checkoutLink` from the response in a browser
4. **Enter the test card** — Use the card number, CVV, and expiry date from the table above
5. **Enter the test OTP** — Use `123456` for a successful transaction
6. **Verify the transaction** — Use the `transactionRef` from the webhook or the `orderReference` you provided

For a detailed walkthrough with request/response examples, see [Sandbox Testing](/docs/products/accept-payment/sandbox-testing).

***

### Fetch Sandbox Checkout Transactions

You can retrieve the details of a specific transaction performed in the sandbox environment by sending a POST request with the transaction reference. This is useful for testing how your system handles different transaction outcomes (e.g., success, failure, pending).

<CodeGroup>
  ```bash Request theme={null}
     curl --request POST \
     --url https://sandbox.nomba.com/v1/transactions/accounts \
     --header 'Authorization: Bearer <token>' \
     --header 'Content-Type: application/json' \
     --header 'accountId: <accountid>' \
     --data '
        {
           "transactionRef": "WEB-ONLINE_C-SANDBOXDFC05-693cd007-cd1e-4ea6-xxxxxxxxxx" 
        }
     '
  ```

  ```bash Response theme={null}
     {
        "code": "00",
        "description": "success",
        "data": {
           "results": [
                 {
                    "id": "WEB-ONLINE_C-SANDBOXDFC05-693cd007-cd1e-4ea6-xxxxxxxxxx",
                    "status": "PAYMENT_SUCCESSFUL",
                    "amount": 4000,
                    "fixedCharge": 123,
                    "source": "web",
                    "type": "online_checkout",
                    "gatewayMessage": "payment successful",
                    "customerBillerId": "543462 **** **** 2808",
                    "timeCreated": "2023-09-08T19:26:34.657000Z",
                    "timeUpdated": "2023-09-08T19:26:34.900000Z",
                    "walletCurrency": "NGN",
                    "userId": "dfc05ca1-4xx5-41dd-xx41-2d362dxxxxx3",
                    "onlineCheckoutOrderId": "a1b2c3d4-e5f6-47a8-xxxx-xxxxxxxxxxxx",
                    "onlineCheckoutOrderReference": "fd3002af-d48b-40a0-adba-xxxxxxxxxxxx",
                    "onlineCheckoutTokenizedCardPayment": "false",
                    "onlineCheckoutCardPan": "543462 **** **** 2808",
                    "onlineCheckoutCurrency": "NGN",
                    "onlineCheckoutCustomerEmail": "abcde@gmail.com",
                    "onlineCheckoutAmount": "4000",
                    "onlineCheckoutPaymentMethod": "card_payment",
                    "onlineCheckoutTokenKey": "N/A",
                    "onlineCheckoutCardType": "Mastercard",
                    "currency": "NGN",
                    "entryType": "CREDIT",
                    "merchantTxRef": "c90d-4bxx-ad0f"
                 }
           ],
           "cursor": "xchbaVFsjdsbaADddd"
        }
     }
  ```
</CodeGroup>


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obtain API Keys

> We are excited to have you here.

## Overview

To obtain API keys for secure authentication to Nomba resources, you must first create an account and complete your KYC.\
Your documents will be reviewed by our compliance team, and approval will be granted once they are validated.

***

## Setting up your account

Getting started is simple. Sign up today to create your account.

During registration, we collect basic information such as your address and estimated revenue. The process is designed to be quick and seamless.

<Note>
  You need a **corporate account** to use the Nomba API.
</Note>

<Steps titleSize="p">
  <Step title="Review your requirements">
    Click **I'm Ready, Let's Begin**

    <Frame caption="Requirement review">
      <img src="https://mintcdn.com/nombainc/dHZLqglLk2ofl5Fe/images/basic-requirement.png?fit=max&auto=format&n=dHZLqglLk2ofl5Fe&q=85&s=d07811d2adf514c116a5fea8738e2a94" style={{ borderRadius: '0.5rem' }} loading="lazy" width="2840" height="1784" data-path="images/basic-requirement.png" />
    </Frame>
  </Step>

  <Step title="Complete registration">
    Complete the account creation steps.
    To complete registration, you must provide a valid email, phone number, Bank Verification Number (BVN), and other required information.\
    You must also upload documents that verify your business.

    See the full list of [acceptable KYB documents](/docs/getting-started/acceptable-documents).

    <Frame caption="Complete sign up">
      <img src="https://mintcdn.com/nombainc/dHZLqglLk2ofl5Fe/images/complete-registration.png?fit=max&auto=format&n=dHZLqglLk2ofl5Fe&q=85&s=fa0d47b5f7446994314374f92b04543c" style={{ borderRadius: '0.5rem' }} loading="lazy" width="2822" height="1782" data-path="images/complete-registration.png" />
    </Frame>
  </Step>

  <Step title="Sign In">
    After registration, [sign in](https://dashboard.nomba.com/auth/login) to your dashboard to generate your API keys.
  </Step>
</Steps>

***

## Get your API Key

You can generate API keys directly from your Nomba dashboard:

1. Go to **Developer** → **API Keys**.
2. Click **Generate API keys**.
3. Copy your keys for integration with the Nomba API.
4. After copying, proceed to [obtain an access token.](/docs/getting-started/authentication)

<Frame caption="Retrieve your API Keys">
  <img src="https://mintcdn.com/nombainc/dHZLqglLk2ofl5Fe/images/Generate-api-keys.png?fit=max&auto=format&n=dHZLqglLk2ofl5Fe&q=85&s=ce31eb2fdf40127eae24d89fb3cae8e4" style={{ borderRadius: '0.5rem' }} loading="lazy" width="2876" height="1716" data-path="images/Generate-api-keys.png" />
</Frame>

After completing your integration and testing in the Sandbox environment, you will need access to production keys to start processing real transactions.

Please reach out to the Nomba team to enable your production keys.

<Warning>
  Always protect your secret keys. Anyone with access to them can gain control of your account.
</Warning>

***

## Adding a team member

You can invite colleagues to collaborate on your Nomba dashboard.

1. Go to the **Teams** section in the left menu and click on add team member.
2. Enter your colleague’s email address and send the invitation.
3. The invitee will receive an email and can accept it to join your team.

Each member can be assigned a role with specific permissions:

* **Owner** – Full access, including account and billing management.
* **Super Admin** – Full access to resources and settings, a Super Administrator has unrestricted access to all current and future accounts under this business. Assign this role with caution, as it grants complete control.
* **IT/Developer** – Access to API keys, integrations, and technical resources.
* **Unassigned User** – Limited access until a role is assigned.

This role-based access ensures each team member only has the permissions necessary for their responsibilities.

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Acceptable KYB Documents

> Learn the documents needed for KYB verification

To comply with local regulations, we require specific documents. These documents are necessary for Know Your Customer (KYB) verification purposes and help ensure the legitimacy of your business.

## KYB Document Stages

1. Pre-Approval

2. Post-Approval

<Note>
  We must collect these documents for verification purposes as they are mandated by our local regulators.
</Note>

## Business Category Types

Depending on the business category you select, we will request documents specific to that type. The four business categories are:

1. Private or Public Limited Company (LTD/PLC),

2. Business Name

3. Registered Partnership

4. Incorporated Trustees

To learn more about the document requirements for each business category, please visit the Business Requirements section.

***

## Acceptable Documents

**Certificate of Incorporation**

This is a formal document issued by the Corporate Affairs Commission (CAC) that signifies the official registration of the company.

**CAC Status Report**

This includes various CAC forms, such as CAC 2, CAC 7, CAC 1.1, CAC BN1 and Form CAC/IT 1. These documents provide a status update or profile of a company, indicating that it is properly registered with the CAC.

**Board Resolution**

A document signed by a company's board of directors that reflects decisions or actions taken by the board.

**Utility Bill or Bank Statement**

Utility Bill or Bank Statement within the last three months or Rental Agreement (valid for 12 months) These are documents used to verify the physical address of the business.

**BVN (Bank Verification Number)**

The Bank Verification Number (BVN) of the business owners is used for identity verification and security, along with a valid form of identification.

**NIN (National Identification Number)**

The National Identification Number (NIN) or a valid ID is used to verify the identity of the business's directors.

**Partnership Resolution (For Partnerships)**

A written agreement or decision made by the partners of a business, typically regarding the operation or governance of the partnership.

**Valid ID**

A Valid ID (such as a national ID, BVN, NIN, passport, or driver’s license) for identity verification of the directors, partners, or trustees involved in the business.

**Board of Trustees Resolution (For Incorporated Trustees)**

A resolution document signed by the Board of Trustees, outlining official decisions or actions taken by the board regarding the management or governance of the organization.

***

## Pre-Approval Business Type Requirements

### Private or Public Limited Company (LTD/PLC)

1. Certificate of Incorporation
2. CAC Status Report or CAC 2 AND CAC 7 or CAC 1.1
3. Board Resolution
4. Utility Bill or bank statement within the last three months  or rental agreement valid within 12 months
5. BVN abd NIN of All Directors (1 of each at onboarding)

### Business Name

1. Certificate of Incorporation
2. CAC Status Report or CAC BN1
3. BVN and Valid ID of Business Owners
4. Utility Bill or bank statement within the last three months  or rental agreement valid within 12 months

### Registered Partnership

1. Certificate of Incorporation
2. CAC Status Report or Form CAC/LLP 01 or CAC/LP O1
3. Partnership resolution
4. Utility Bill or bank statement within the last three months  or rental agreement valid within 12 months
5. BVN of ALL Partners (1 of each at onboarding)
6. NIN or Valid ID of Partners
7. BVN and NIN of ALL Partners  (1 of each at onboarding)

### Incorporated Trustees

1. Certificate of Incorporation
2. CAC Status Report or Form CAC/ IT 1
3. Board of Trustees resolution
4. Utility Bill or bank statement within the last three months  or rental agreement valid within 12 months
5. BVN of ALL Partners (1 of each at onboarding)
6. NIN or Valid ID of Trustees

***

## Post Approval Business Type Requirements

### Private or Public Limited Company (LTD/PLC)

1. Tax Identification Number
2. SCMUL
3. BVN and NIN of all shareholders above 5% shareholding
4. Social media handle of the business

### Business Name

1. Tax Identification Number
2. SCMUL
3. Social media handle of the business

### Registered Partnership

1. Business Operating license (if applicable)
2. Tax Identification Number
3. SCMUL
4. Registered Partnership Agreement/Deed (certified as true copy by the Registrar of Companies)
5. Social media handle of the business

### Incorporated Trustees

1. Business Operating license
2. Tax Identification Number
3. SCMUL
4. Social media handle of the business

<Note>
  It's important to note that some documents can be substituted, and they are indicated on the sheet with **' or'**. For instance, the merchant can provide either  a Utility Bill or bank statement within the last three months or a rental agreement valid within 12 months
</Note>


> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Authenticate

> Learn how to ensure secure access to Nomba API Resources.

## Overview

Nomba uses **OAuth 2.0** to secure API access.
You'll use your `client_id` and `client_secret` to obtain an `access_token`. To get the client credentials from the Nomba dashboard, follow the steps on how to [obtain API keys](/docs/getting-started/get-api-keys).

The authentication flow has three key steps:

1. **Obtain** an `access_token` and `refresh_token`
2. **Refresh** the token when it expires
3. **Revoke** the token when no longer needed

## Obtain Access Token

Use the `client_credentials` grant to request an `access_token` and `refresh_token`.  The `access_token` is required for making API requests.

<CodeGroup>
  ```bash cURL theme={null}
      curl --request POST \
        --url https://api.nomba.com/v1/auth/token/issue \
        --header 'Content-Type: application/json' \
        --header 'accountId: <accountid>' \
        --data '{
        "grant_type": "client_credentials",
        "client_id": "replace-with-your-client-id",
        "client_secret": "replace-with-your-client-secret"
      }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://api.nomba.com/v1/auth/token/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accountId': '<accountid>',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: 'replace-with-your-client-id',
      client_secret: 'replace-with-your-client-secret',
    }),
  });

  const { code, data } = await response.json();
  if (code !== '00') throw new Error('Authentication failed');

  const { access_token, refresh_token, expiresAt } = data;
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://api.nomba.com/v1/auth/token/issue',
      headers={
          'Content-Type': 'application/json',
          'accountId': '<accountid>',
      },
      json={
          'grant_type': 'client_credentials',
          'client_id': 'replace-with-your-client-id',
          'client_secret': 'replace-with-your-client-secret',
      },
  )

  result = response.json()
  if result['code'] != '00':
      raise Exception('Authentication failed')

  access_token = result['data']['access_token']
  refresh_token = result['data']['refresh_token']
  ```

  ```json Response theme={null}
    {
      "code": "00",
      "description": "Success",
      "data": {
        "businessId": "01a10aeb-d989-460a-bbde-9842f2b4320f",
        "access_token": "eyJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "01h4gdx2tctxfjgacbdwrcvs5d1688473602892",
        "expiresAt": "2022-07-08T14:33:00Z"
      }
    }
  ```
</CodeGroup>

## Refresh Access Token

Access tokens expire after 30 minutes.
Instead of requesting a new token with your credentials, exchange the `refresh_token` for a new `access_token`.
This avoids exposing your client\_secret repeatedly and keeps the process secure.

<Note>
  We recommend refreshing your `access_token` at least 5 minutes before it expires.
</Note>

<CodeGroup>
  ```bash cURL theme={null}
    curl --request POST \
      --url https://api.nomba.com/v1/auth/token/refresh \
      --header 'Authorization: Bearer <token>' \
      --header 'Content-Type: application/json' \
      --header 'accountId: <accountid>' \
      --data '{
      "grant_type": "refresh_token",
      "refresh_token": "01h4gdx2tctxfjgacbdwrcvs5d1688473602892"
    }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://api.nomba.com/v1/auth/token/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accountId': '<accountid>',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const { code, data } = await response.json();
  if (code !== '00') throw new Error('Token refresh failed');

  const newAccessToken = data.access_token;
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://api.nomba.com/v1/auth/token/refresh',
      headers={
          'Authorization': f'Bearer {access_token}',
          'Content-Type': 'application/json',
          'accountId': '<accountid>',
      },
      json={
          'grant_type': 'refresh_token',
          'refresh_token': refresh_token,
      },
  )

  result = response.json()
  if result['code'] != '00':
      raise Exception('Token refresh failed')

  new_access_token = result['data']['access_token']
  ```

  ```json Response theme={null}
    {
      "code": "00",
      "description": "Success",
      "data": {
        "businessId": "01a10aeb-d989-460a-bbde-9842f2b4320f",
        "access_token": "eyJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "01h4gdx2tctxfjgacbdwrcvs5d1688473602892",
        "expiresAt": "2022-07-08T14:33:00Z"
      }
    }
  ```
</CodeGroup>

## Revoke Access Token

Revoke an `access_token` when you need to immediately terminate access.
This is useful if the token is compromised, expired, or no longer needed.
Once revoked, the token is invalid and cannot be used to access resources.

<CodeGroup>
  ```bash cURL theme={null}
    curl --request POST \
      --url https://api.nomba.com/v1/auth/token/revoke \
      --header 'Content-Type: application/json' \
      --header 'accountId: <accountid>' \
      --data '{
      "clientId": "2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d",
      "access_token": "<access_token_to_revoke>"
    }'
  ```

  ```javascript Node.js theme={null}
  const response = await fetch('https://api.nomba.com/v1/auth/token/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accountId': '<accountid>',
    },
    body: JSON.stringify({
      clientId: '2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d',
      access_token: accessToken,
    }),
  });

  const { code } = await response.json();
  if (code !== '00') throw new Error('Token revocation failed');
  ```

  ```python Python theme={null}
  import requests

  response = requests.post(
      'https://api.nomba.com/v1/auth/token/revoke',
      headers={
          'Content-Type': 'application/json',
          'accountId': '<accountid>',
      },
      json={
          'clientId': '2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d',
          'access_token': access_token,
      },
  )

  result = response.json()
  if result['code'] != '00':
      raise Exception('Token revocation failed')
  ```

  ```json Response theme={null}
    {
      "code": "00",
      "description": "Token revoked successfully"
    }
  ```
</CodeGroup>

## Authentication Best Practices

To keep your integration secure, follow these best practices:

* Never expose credentials (`client_id`, `client_secret`, `refresh_token`) in frontend code or public repositories.

* Use secure storage for tokens in your backend (e.g., environment variables, encrypted storage).

* Refresh tokens proactively (5 minutes before expiry) instead of waiting until the last moment.

* Revoke tokens immediately if you suspect they've been leaked or compromised.

* Rotate credentials periodically and remove unused API keys.
