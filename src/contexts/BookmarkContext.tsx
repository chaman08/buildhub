
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

interface BookmarkContextType {
  bookmarkedContractors: string[];
  bookmarkedProjects: string[];
  toggleContractorBookmark: (contractorId: string) => Promise<void>;
  toggleProjectBookmark: (projectId: string) => Promise<void>;
  isContractorBookmarked: (contractorId: string) => boolean;
  isProjectBookmarked: (projectId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useAuth();
  const [bookmarkedContractors, setBookmarkedContractors] = useState<string[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<string[]>([]);

  // Early return if auth context is not available yet
  if (!authContext) {
    return <>{children}</>;
  }

  const { currentUser } = authContext;

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!currentUser) return;

      try {
        const bookmarkDoc = await getDoc(doc(db, 'bookmarks', currentUser.uid));
        if (bookmarkDoc.exists()) {
          const data = bookmarkDoc.data();
          setBookmarkedContractors(data.contractors || []);
          setBookmarkedProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    loadBookmarks();
  }, [currentUser]);

  const toggleContractorBookmark = async (contractorId: string) => {
    if (!currentUser) return;

    try {
      const newBookmarks = bookmarkedContractors.includes(contractorId)
        ? bookmarkedContractors.filter(id => id !== contractorId)
        : [...bookmarkedContractors, contractorId];

      setBookmarkedContractors(newBookmarks);
      await setDoc(doc(db, 'bookmarks', currentUser.uid), {
        contractors: newBookmarks,
        projects: bookmarkedProjects
      });
    } catch (error) {
      console.error('Error toggling contractor bookmark:', error);
    }
  };

  const toggleProjectBookmark = async (projectId: string) => {
    if (!currentUser) return;

    try {
      const newBookmarks = bookmarkedProjects.includes(projectId)
        ? bookmarkedProjects.filter(id => id !== projectId)
        : [...bookmarkedProjects, projectId];

      setBookmarkedProjects(newBookmarks);
      await setDoc(doc(db, 'bookmarks', currentUser.uid), {
        contractors: bookmarkedContractors,
        projects: newBookmarks
      });
    } catch (error) {
      console.error('Error toggling project bookmark:', error);
    }
  };

  const isContractorBookmarked = (contractorId: string) => {
    return bookmarkedContractors.includes(contractorId);
  };

  const isProjectBookmarked = (projectId: string) => {
    return bookmarkedProjects.includes(projectId);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedContractors,
        bookmarkedProjects,
        toggleContractorBookmark,
        toggleProjectBookmark,
        isContractorBookmarked,
        isProjectBookmarked,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
