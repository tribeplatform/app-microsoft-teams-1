import { NetworkRepository } from "@repositories";
import { getListOfTeams } from "./microsoft-info.logic";

export enum SettingsBlockCallback {
  Save = 'save',
  ModalSave = 'modal-save',
  OpenModal = 'open-modal',
  OpenToast = 'open-toast',
  Redirect = 'redirect',
  AuthRedirect = 'auth-redirect',
  AuthVoke= 'auth-voke',
  FetchChannels = 'fetch-channels',
  SaveModal = 'save-modal'
}

