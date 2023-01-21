export declare global {
  namespace ReactNavigation {
    // Colocamos quais parâmetros queremos levar de uma tela para outra
    interface RootParamList {
      home: undefined;
      new: undefined;
      habit: {
        date: string;
      };
    }
  }
}
