const getEnvValue =
  <ParsedType>(parser: (value: string) => ParsedType) =>
  (key: string, fallback: ParsedType): ParsedType => {
    const value = process.env[key];

    if (!value) {
      if (fallback === undefined) {
        throw Error(`Missing key ${key} from env and no fallback was provided`);
      }

      return fallback;
    }

    return parser(value);
  };

export const Env = {
  string: getEnvValue(String),
  number: getEnvValue(Number),
};

export type EnvType = "development" | "test" | "production";
