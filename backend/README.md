
# Run the backend service

```bash 
poetry run uvicorn main:app --reload
```

# Upload audit

## Example of sending a contract with an audit as a file

- Request: `POST`

```bash
curl \
   -F user_address=0x30c96825922151a293175993B74216D9FacDb668 \
   -F contract=@contract.sol \
   -F audit=@example.txt \
   localhost:8000/audit/upload/files
```

## Example of sending a smart contract address with an audit as a file

- Request: `POST`

```bash
curl \
   -F user_address="0x30c96825922151a293175993B74216D9FacDb668" \
   -F contract_address="0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413" \
   -F audit=@example.txt \
   localhost:8000/audit/upload/address
```

## Example of senging a smart contract for auditing

- Request: `POST`

```bash
curl localhost:8000/audit/analyse \
   -F contract=@vuln/random.sol
```

# List of the user request

- Request: `GET`

```bash
curl localhost:8000/audit/list
```

# Smart contract issues

> https://github.com/crytic/not-so-smart-contracts


> https://docs.kanaries.net/tutorials/ChatGPT/how-to-train-chatgpt
