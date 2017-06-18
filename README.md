## Preparing the images

### Backend
* Build (or update) docker image:
``
cd be/
docker build -f be.dockerfile -t bulankou/ai-talk3:be_0.3 .
``

* Run in docker
``docker run --name ai-talk3-be -p 8080:8080 -d bulankou/ai-talk3:be_0.3` `

* Push to dockerhub
``docker push bulankou/ai-talk3:be_0.3``


## Deploy with kubernetes minikube

* Publish to minikube (first remove already existing service)
``
kubectl delete deployment ai-talk3-app && kubectl delete service ai-talk3-service
kubectl create -f k8.yaml
``

* After waiting for exposure to propage you can get IP by running:
``minikube service --url ai-talk3-service``

* Test it (replace port with the port obtained in previous command): 
``curl -i http://192.168.99.100:30121/stock?s={aapl,msft,amzn,fb}``

## Run with docker-compose
* Deploy with docker-compose
``docker compose -f docker-compose.yaml up``