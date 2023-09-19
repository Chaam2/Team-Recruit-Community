import { IProjectList, IProjectListFilter } from '../interfaces/Project.interface';
import { atom } from 'recoil';

export const projectListFilterState = atom<IProjectListFilter>({
  key: 'ProjectListFilter',
  default: {
    selectedCategory: 'all',
    searchKeyword: '',
    recruitingMode: 'all',
  },
});

export const projectListState = atom<IProjectList>({
  key: 'ProjectList',
  default: {
    data: [],
    page: { moreData: false, currentPage: 1, size: 0 },
    load: {
      isLoading: true,
      isError: false,
    },
  },
});
