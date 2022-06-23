import { faFloppyDisk, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Input, Spacer } from '@nextui-org/react';
import React from 'react';
import { MultiValue, SingleValue } from 'react-select';

import { ColoredSelect } from '../../../components';
import { Environment, Tab, useEnvironmentsStore, useTabsStore } from '../../../storage';
import { CreateEnvironmentModal } from '../../environments';
import { SendButton } from './send-button.styled';

export interface SendHeaderProps {
  tab: Tab;
}

export const SendHeader: React.FC<SendHeaderProps> = ({ tab }) => {
  const { updateTab } = useTabsStore((store) => store);
  const { removeEnvironment } = useEnvironmentsStore((store) => store);
  const environments = useEnvironmentsStore((store) => store.environments);

  const [createEnvironmentModalVisible, setCreateEnvironmentModalVisible] = React.useState(false);

  const [selectedEnvironment, setSelectedEnvironment] = React.useState<Environment | null>(
    tab.environment || null
  );

  const [url, setUrl] = React.useState<string>();

  const handleEnvironmentChange = (value: MultiValue<Environment> | SingleValue<Environment>) => {
    const updatedTab: Tab = {
      ...tab,
      environment: value as Environment,
    };

    setSelectedEnvironment(value as Environment);
    updateTab(updatedTab);
  };

  const handleUrlChange = (url: string) => {
    setUrl(url);
    setSelectedEnvironment(null);
  };

  return (
    <>
      <Container gap={0.5} fluid css={{ display: 'flex', flexWrap: 'nowrap' }}>
        <ColoredSelect
          bordered
          borderWeight="light"
          size="sm"
          placeholder="Environment"
          options={environments}
          css={{ width: 150 }}
          value={selectedEnvironment}
          onChange={handleEnvironmentChange}
          onRemove={(data) => {
            removeEnvironment(data.value);
          }}
        />
        <Spacer x={0.2} />
        <Input
          size="sm"
          bordered
          borderWeight="light"
          animated={false}
          clearable
          placeholder="127.0.0.1:3000"
          css={{ flex: 5 }}
          contentRight={
            <Button
              auto
              light
              icon={<FontAwesomeIcon icon={faFloppyDisk} />}
              css={{
                background: 'transparent',
                padding: 0,
                margin: 0,
                minWidth: 10,
                color: '$accents6',
                '&:hover': {
                  color: '$accents5',
                },
              }}
              onClick={() => setCreateEnvironmentModalVisible(true)}
            />
          }
        />
        <Spacer x={0.5} />
        <SendButton
          size="sm"
          bordered
          color="gradient"
          iconRight={<FontAwesomeIcon icon={faPaperPlane} />}
        >
          Send
        </SendButton>
      </Container>
      <CreateEnvironmentModal
        closeButton
        preventClose
        blur
        open={createEnvironmentModalVisible}
        onClose={() => setCreateEnvironmentModalVisible(false)}
      />
    </>
  );
};
