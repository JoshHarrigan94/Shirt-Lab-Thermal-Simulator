# ShirtLab Product Spec

## Product vision

ShirtLab is a 3D thermal clothing simulator for appraising sportswear claims. It compares how fabric, cut, perforation, moisture handling and environment affect athletic comfort and heat management.

## Primary question

Does a garment design materially improve cooling, moisture control or comfort under real athletic conditions, or is the benefit mostly marketing/aesthetic?

## Initial benchmark

Compare a premium MothTech-style perforated cotton tee against:

- standard cotton tee
- DIY punched cotton tee
- polyester running tee
- open mesh polyester tee
- merino blend tee

## Core user workflow

1. Choose activity and effort.
2. Choose weather conditions.
3. Configure Shirt A.
4. Configure Shirt B.
5. Run comparison.
6. Inspect 3D views and zone readouts.

## Core outputs

- winner by thermal comfort
- cooling gap
- value score
- claim confidence
- zone-level comfort differences
- airflow score
- moisture score
- thermal readout

## Future modules

- garment mesh imports via glTF
- real perforation painting
- custom body dimensions
- real-world run experiment logging
- shirt pre/post weight tracking
- IR camera or skin temperature data capture
- validation dataset
- WebGPU field simulation
