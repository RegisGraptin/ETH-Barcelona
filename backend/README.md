
# Run the backend service

```bash 
poetry run uvicorn main:app --reload
```

# Upload audit


curl localhost:8000/audit/upload \
   -F contract=@contract.sol \
   -F audit=@example.pdf



curl localhost:8000/audit/analyse \
   -F contract=@vuln/random.sol


curl -i localhost:8000/audit/analyse \
   -F contract=@example/multisig.sol \
   -F use_database=true



curl https://chatgpt-api.shn.hk/v1/ \
  -H 'Content-Type: application/json' \
  -d '{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "Hello, how are you?"}]
}'


# Smart contract issues

> https://github.com/crytic/not-so-smart-contracts


> https://docs.kanaries.net/tutorials/ChatGPT/how-to-train-chatgpt