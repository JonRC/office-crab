#!/bin/bash

cd "$(dirname "$0")"
cd ../performance-summary
npm run start

IS_WSL="$(which wslview)"
if [ ! -z $IS_WSL ];
then
  echo opening summary.xlsx
  wslview ./summary.xlsx
fi