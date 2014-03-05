#!/bin/sh

time node schema/dropSchema && time node schema/createSchema && time node schema/loadTestData
