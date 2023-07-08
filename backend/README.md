
# Run the backend service

```bash 
poetry run uvicorn main:app --reload
```

# Upload audit


## Example of sending a contract with an audit as a file

```bash
curl localhost:8000/audit/upload \
   -F contract=@contract.sol \
   -F audit=@example.txt
```

## Example of sending a smart contract address with an audit as a file

curl \
   -F contract_address="0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413" \
   -F audit=@example.txt \
   localhost:8000/audit/upload


## Example of senging a smart contract for auditing

curl localhost:8000/audit/analyse \
   -F contract=@vuln/random.sol


# Smart contract issues

> https://github.com/crytic/not-so-smart-contracts


> https://docs.kanaries.net/tutorials/ChatGPT/how-to-train-chatgpt
