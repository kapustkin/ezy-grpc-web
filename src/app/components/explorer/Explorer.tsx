import { CSS, Grid } from '@nextui-org/react';
import React from 'react';

import { ExplorerHeader } from './explorer-header';

const ExplorerGridStyles: CSS = {
  margin: 0,
  minWidth: '250px',
  maxWidth: '250px',
  background: '$backgroundContrast',
  borderRight: 'solid $border 1px',
};

export interface ExplorerProps {
  children: React.ReactNode;
  header: React.ReactNode;
  sideBar: React.ReactNode;
}

export const Explorer: React.FC<ExplorerProps> = ({ children, header, sideBar }) => (
  <Grid.Container wrap="nowrap">
    <Grid css={ExplorerGridStyles}>
      <ExplorerHeader>{header}</ExplorerHeader>
      {sideBar}
    </Grid>
    <Grid css={{ width: '100%', overflow: 'hidden' }}>{children}</Grid>
  </Grid.Container>
);
