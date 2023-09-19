import { TypeProjectList } from '@/interfaces/Project.interface';
import { atom } from 'recoil';

export interface ProjectListFilter {
  selectedCategory: string;
  searchKeyword: string;
  recruitingMode: string;
}

export const projectListFilterState = atom<ProjectListFilter>({
  key: 'ProjectListFilter',
  default: {
    selectedCategory: 'all',
    searchKeyword: '',
    recruitingMode: 'all',
  },
});

export interface ProjectList {
  data: TypeProjectList[];
  page: { moreData: boolean; currentPage: number; size: number };
  load: {
    isLoading: boolean;
    isError: boolean;
  };
}

export const projectListState = atom<ProjectList>({
  key: 'ProjectList',
  default: {
    data: [],
    page: { moreData: false, currentPage: 0, size: 0 },
    load: {
      isLoading: true,
      isError: false,
    },
  },
});
