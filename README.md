# FileSign

## Installation and execution using host system
To launch FileSign, run the following command:
```shell
npm install && npm run start
```

To execute the server in development mode, run the following command:
```shell
npm install && npm run start:dev
```


## Installation and execution using Docker
To build and run using Docker, run the following commands:
```shell
# build the image
docker build -t filesign.carmentis .

# run the image
docker run --rm -d -p 2000:3000 -v $(pwd)/storage:/app/storage --name filesign filesign.carmentis
```