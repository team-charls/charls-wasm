# Performance Measurements

## Environment

* Intel i9-9900K, DDR4-2666 MHz RAM
* Ubuntu 19.10

## Test Images

* ftp://medical.nema.org/MEDICAL/Dicom/DataSets/WG04/compsamples_jpegls.tar

## Node.js 14.0.0

### Decode

* ct1.jls - 6.38 ms
* ct2.jls - 6.20 ms
* mg1.jls - 421.32 ms

### Encode

* CT2 - 7.24 ms

## FireFox 75.0

### Decode

* ct1.jls - 6.00 ms
* ct2.jls - 6.00 ms
* mg1.jls - 370.00 ms

## Google Chrome 81.0

### Decode

* ct1.jls - 7.14 ms
* ct2.jls - 7.19 ms
* mg1.jls - 463.06 ms

## Native C++

* ct1.jls - 3.38 ms
* ct2.jls - 3.44 ms
* mg1.jls - 227.22 ms

