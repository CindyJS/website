#!/bin/bash

set -e
umask 0077
openssl aes-256-cbc -K "${encrypted_e7f1c3b6092d_key}" -iv "${encrypted_e7f1c3b6092d_iv}" \
    -in tools/travis-ssh.enc -out travis-ssh -d
umask 0022
set -x
eval "$(ssh-agent -s)"
ssh-add travis-ssh
rm travis-ssh

mkdir -p "${HOME}/.ssh"
cat tools/cindyjs.org.pub >> "${HOME}/.ssh/known_hosts"
rsync --delete-delay -rci --rsh='ssh -l deploy -p 7723' dist/ cindyjs.org::website/
