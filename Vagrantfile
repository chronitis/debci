# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "debian-jessie"
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.provision :shell do |shell|
    shell.path = 'tools/vagrant-provision'
  end
end
