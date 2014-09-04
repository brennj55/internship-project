sudo rm /var/lib/mongodb/mongod.lock 
mongod -repair
sudo service mongodb start

mongod --fork --logpath /vagrant/logs/mongodb.log
. /vagrant/gw/env/bin/activate
python /vagrant/gw/app.py&
#python /vagrant/PredictED/app.py&