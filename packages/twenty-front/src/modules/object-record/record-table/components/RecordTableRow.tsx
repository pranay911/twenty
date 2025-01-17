import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { RecordTableCellContainer } from '@/object-record/record-table/components/RecordTableCellContainer';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { CheckboxCell } from './CheckboxCell';

type RecordTableRowProps = {
  recordId: string;
  rowIndex: number;
};

const StyledTd = styled.td`
  background-color: ${({ theme }) => theme.background.primary};
`;

export const RecordTableRow = ({ recordId, rowIndex }: RecordTableRowProps) => {
  const { getVisibleTableColumnsSelector, isRowSelectedFamilyState } =
    useRecordTableStates();
  const currentRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));
  const { objectMetadataItem } = useContext(RecordTableContext);

  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current,
    rootMargin: '1000px',
  });

  return (
    <RecordTableRowContext.Provider
      value={{
        recordId,
        rowIndex,
        pathToShowPage:
          getBasePathToShowPage({ objectMetadataItem }) + recordId,
        isSelected: currentRowSelected,
      }}
    >
      <tr
        ref={elementRef}
        data-testid={`row-id-${recordId}`}
        data-selectable-id={recordId}
      >
        <StyledTd>
          <CheckboxCell />
        </StyledTd>
        {[...visibleTableColumns]
          .sort((columnA, columnB) => columnA.position - columnB.position)
          .map((column, columnIndex) => {
            return inView ? (
              <RecordTableCellContext.Provider
                value={{
                  columnDefinition: column,
                  columnIndex,
                }}
                key={column.fieldMetadataId}
              >
                <RecordTableCellContainer />
              </RecordTableCellContext.Provider>
            ) : (
              <td></td>
            );
          })}
        <td></td>
      </tr>
    </RecordTableRowContext.Provider>
  );
};
