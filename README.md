# Ant Demo

## Summary

The demo leverages Protocol Buffers (_Protobuf_) for defining both the service interfaces and the structure of messages
exchanged between the client and server.

It demonstrates the power of _gRPC_ and _Protobuf_ in facilitating efficient, type-safe communication between different
components of a system.

## Technical overview

### Protobuf

In the context of our project, _Protobuf_ is used for two main purposes:

1. **Data format**: _Protobuf_ defines the format for serialising the structured data that is sent over the network.
   This
   includes defining the structure of requests and responses exchanged between the client and the server.

2. **Service definition**: Besides data serialisation, _Protobuf_ is also used to define the service interface. It
   specifies the methods that can be called remotely, along with their input and output types.

### gRPC

_gRPC_ is an open-source remote procedure call (RPC) system that uses _Protobuf_ for service definition and as its
underlying message interchange format. It provides a framework for executing requests on a server with the protocol of
your choice. In simpler terms, while _Protobuf_ defines the format and structure of the data and services, _gRPC_
handles the transmission of those messages over the network.

### Prerequisites

- _Conda_ (_Anaconda_ or _Miniconda_)

### Setup instructions

Follow these instructions to clone the repository, set up the environment, and run the demo.

1. **Create and activate Conda environment**:

```bash
conda env create -f environment.yml
conda activate ant_demo
```

2. **Install NodeJS dependencies**:

```bash
npm install
```

3. **Generating gRPC stubs**:

We need to generate the Python _gRPC_ stubs from the `.proto` service definitions. These stubs are Python files that
contain classes for the services and the messages defined in the `ant_game.proto` file.

```bash
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. ant_game.proto
```

This command will produce the `ant_game_pb2.py` and `ant_game_pb2_grpc.py` files in your project directory.
These files are necessary for the Python client to communicate with the _gRPC_ server and must be generated any time
the `.proto` files are updated.

### Running the demo

#### Start the NodeJs server

In one terminal window, start the _NodeJs_ server:

```bash
node server.js
```

#### Execute the Python client

In another terminal, run the _Python_ client:

```bash
python client.py
```



