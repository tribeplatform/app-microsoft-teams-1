import { WebhookType } from '@enums'
import { BaseWebhook, WebhookEntities } from '@interfaces'
import { Member, Network, PermissionContext } from '@tribeplatform/gql-client/types'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

import { AppSettingDto } from './app-setting.dto'

class WebhookEntitiesDto implements WebhookEntities {
  @IsOptional()
  // @ValidateNested()
  @Type(() => AppSettingDto)
  network?: Network

  @IsOptional()
  // @ValidateNested()
  @Type(() => AppSettingDto)
  actor?: Member

  @IsOptional()
  // @ValidateNested()
  @Type(() => AppSettingDto)
  owner?: Member

  @IsOptional()
  // @ValidateNested()
  @Type(() => AppSettingDto)
  targetMember?: Member
}
export class WebhookDto<T = unknown> implements BaseWebhook {
  @IsEnum(WebhookType)
  type: WebhookType
  

  @IsString()
  networkId: string

  @IsEnum(PermissionContext)
  context: PermissionContext

  @IsOptional()
  @IsString()
  entityId?: string

  @IsArray()
  @Type(() => AppSettingDto)
  @ValidateNested({ each: true })
  currentSettings: AppSettingDto[]

  @IsOptional()
  data?: T
  @IsOptional()
  @Type(() => WebhookEntitiesDto)
  entities?: WebhookEntitiesDto
}
