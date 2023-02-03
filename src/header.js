loadAPI(17);

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Allen & Heath", "Xone K2 Max", "0.1", "75384fea-1307-4775-90a3-65dbfd983105", "foonta");

host.defineMidiPorts(1, 1);
