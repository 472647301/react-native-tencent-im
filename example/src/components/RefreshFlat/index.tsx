import React, {useRef, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {FlatList, FlatListProps, StyleSheet} from 'react-native';
import {RefreshControl} from '@byron-react-native/refresh-control';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {forwardRef, useImperativeHandle} from 'react';

export interface RefreshFlatListProps<ItemT> extends FlatListProps<ItemT> {
  onHeader?: () => Promise<void>;
  onFooter?: () => Promise<FooterStatus | void>;
}

export enum FooterStatus {
  Idle, // 初始状态，无刷新的情况
  CanLoadMore, // 可以加载更多，表示列表还有数据可以继续加载
  Refreshing, // 正在刷新中
  NoMoreData, // 没有更多数据了
  Failure, // 刷新失败
}

export interface FooterRef {
  changeStatus: (status: FooterStatus) => void;
}

function RefreshFlatList<ItemT>(props: RefreshFlatListProps<ItemT>) {
  const headerTracker = useRef(false);
  const footerRef = useRef<FooterRef>(null);
  const footerTracker = useRef<Record<number, boolean>>({});
  const footerInProgress = useRef(false);

  const onHeader = async () => {
    if (!props.onHeader) {
      return;
    }
    headerTracker.current = true;
    await props.onHeader();
    headerTracker.current = false;
    footerTracker.current = {};
    footerRef.current?.changeStatus(FooterStatus.Idle);
  };

  const onFooter = async () => {
    if (!props.onFooter) {
      return;
    }
    if (headerTracker.current) {
      return;
    }
    if (footerInProgress.current) {
      return;
    }
    const length = props.data?.length || 0;
    if (length && footerTracker.current[length]) {
      footerRef.current?.changeStatus(FooterStatus.NoMoreData);
      return;
    }
    footerInProgress.current = true;
    footerRef.current?.changeStatus(FooterStatus.Refreshing);
    const result = await props.onFooter();
    footerTracker.current[length] = true;
    footerInProgress.current = false;
    if (typeof result === 'number') {
      footerRef.current?.changeStatus(result);
    } else {
      footerRef.current?.changeStatus(FooterStatus.Idle);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    props.onScroll?.(event);
    const offset = event.nativeEvent.contentOffset.y;
    const visibleLength = event.nativeEvent.layoutMeasurement.height;
    const contentLength = event.nativeEvent.contentSize.height;
    const onEndReachedThreshold = props.onEndReachedThreshold || 10;
    const length = contentLength - visibleLength - offset;
    const isScrollAtEnd = length < onEndReachedThreshold;
    if (isScrollAtEnd) onFooter();
  };

  const refreshControl = props.onHeader ? (
    <RefreshControl onRefresh={onHeader} />
  ) : (
    void 0
  );

  return (
    <FlatList
      {...props}
      onEndReached={null}
      onScroll={handleScroll}
      ListFooterComponent={() => <FooterComponent ref={footerRef} />}
      refreshControl={refreshControl}
    />
  );
}

const FooterComponent = forwardRef<FooterRef>((props, ref) => {
  const [status, setStatus] = useState(FooterStatus.Idle);

  useImperativeHandle(ref, () => ({
    changeStatus: (val: FooterStatus) => {
      setStatus(val);
    },
  }));

  const renderTemplate = () => {
    let temp = <></>;
    switch (status) {
      case FooterStatus.CanLoadMore:
        temp = (
          <View style={styles.footer}>
            <Text style={styles.text}>{'上拉加载更多'}</Text>
          </View>
        );
        break;
      case FooterStatus.Refreshing:
        temp = (
          <View style={styles.footer}>
            <ActivityIndicator color={'#fff'} size="small" />
            <Text style={styles.text}>{'努力加载中...'}</Text>
          </View>
        );
        break;
      case FooterStatus.NoMoreData:
        temp = (
          <View style={styles.footer}>
            <Text style={styles.text}>{'-- 到底了, 滑不动了 --'}</Text>
          </View>
        );
        break;
      case FooterStatus.Failure:
        temp = (
          <View style={styles.footer}>
            <Text style={styles.text}>{'加载失败'}</Text>
          </View>
        );
        break;
    }
    return temp;
  };

  return renderTemplate();
});

const styles = StyleSheet.create({
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
});

export default RefreshFlatList;
