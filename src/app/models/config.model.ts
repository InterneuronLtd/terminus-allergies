export class Uris {
    public baseuri: string;
    public carerecorduri: string;
    public terminologyuri: string;
    public autonomicuri: string;
    public imageserveruri: string;
    public identityserveruri: string;
    public currentmedsmoduleuri: string;
    public nhsdigitaluri:string;
  }

  export class Appsettings {
    sessionStartTime: number;
    maxIntakeRoutes: number;
    maxOutputRoutes: number;
    allergies_added_notif_msg: string;
    allergies_edited_notif_msg: string;
    can_send_notification: boolean;
    can_receive_notification: boolean;
  }

  export class ConfigModel {
    constructor(
      public uris?: Uris,
      public enablelogging?: boolean,
      public appsettings: Appsettings = new Appsettings(),
      public prodbuild?: boolean,
      public enablegpconnect?: boolean
    ) { };
  }
