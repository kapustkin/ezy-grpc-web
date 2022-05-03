import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { styled } from '@nextui-org/react';
import { Tabs as AntdTabs } from 'antd';
import React from 'react';

import { DraggableTab } from './DraggableTab';

const { TabPane: AntdTabPane } = AntdTabs;

// @ts-ignore
const StyledTabs = styled(AntdTabs, {
  '.ant-tabs-nav-list': {
    display: 'flex',
    flexWrap: 'nowrap',
    paddingTop: 5,
    paddingLeft: 5,
    overflow: 'auto',
    borderBottom: 'solid $accents2 1px',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  '.ant-tabs-tab': {
    height: 40,
    font: 'inherit',
    paddingLeft: 10,
    paddingRight: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    userSelect: 'none',
    background: '$accents1',
    borderLeft: 'solid $accents2 1px',
    borderRight: 'solid $accents2 1px',
    '&:focus': {
      outline: 'none',
    },
  },
  '.ant-tabs-tab-active': {
    background: '$accents2',
    borderBottom: 'solid $primary 2px',
  },
});

const StyledTabPane = styled(AntdTabPane);

export interface TabProps {
  id: string;

  title: string;

  content: React.ReactNode;
}

export interface DraggableTabsProps {
  tabs: TabProps[];

  activeKey?: string;

  onChange?: (activeKey: string) => void;

  onDragEnd?: (event: DragEndEvent) => void;
}

export const DraggableTabs: React.FC<DraggableTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  onDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 30,
      },
    })
  );

  return (
    <StyledTabs
      activeKey={activeKey}
      onChange={onChange}
      type="line"
      renderTabBar={(props, DefaultTabBar) => (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tabs}>
            <DefaultTabBar {...props}>
              {(node) => <DraggableTab id={node.key as string}>{node}</DraggableTab>}
            </DefaultTabBar>
          </SortableContext>
        </DndContext>
      )}
    >
      {tabs.map((tab) => (
        <StyledTabPane key={tab.id} tab={tab.title}>
          {tab.content}
        </StyledTabPane>
      ))}
    </StyledTabs>
  );
};
