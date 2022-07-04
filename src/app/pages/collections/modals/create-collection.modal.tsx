import { Button, Modal, ModalProps, Spacer, Text } from '@nextui-org/react';
import React from 'react';

import { Badge } from '../../../components';
import { Collection, CollectionType, useCollectionsStore } from '../../../storage';
import { CollectionForm } from '../forms';

export const CreateCollectionModal: React.FC<ModalProps> = ({ onClose = () => {}, ...props }) => {
  const createCollection = useCollectionsStore((store) => store.createCollection);

  const handleSubmit = async (payload: Collection<CollectionType>) => {
    const proto = await window.electron.protobuf.loadFromFile(
      payload.options.path,
      payload.options.includeDirs
    );

    createCollection({
      ...payload,
      type: CollectionType.GRPC,
      // @ts-ignore
      children: proto,
    });

    onClose();
  };

  return (
    <Modal {...props} onClose={onClose} css={{ backgroundColor: 'transparent', maxHeight: '90vh' }}>
      <Modal.Header css={{ userSelect: 'none' }}>
        <Spacer />
        <Text>New Collection</Text>
        <Spacer />
        <Badge text="PROTO" color="primary" size="xs" bordered />
      </Modal.Header>
      <Modal.Body>
        <CollectionForm id="create-collection-form" onSubmit={handleSubmit} />
      </Modal.Body>
      <Modal.Footer>
        <Button auto bordered size="sm" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button
          auto
          bordered
          size="sm"
          color="gradient"
          type="submit"
          form="create-collection-form"
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
