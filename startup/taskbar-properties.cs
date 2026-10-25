using System;
using System.Runtime.InteropServices;
[StructLayout(LayoutKind.Sequential)] public struct FadePropertyKey {
 public Guid fmtid; public uint pid;
 public FadePropertyKey(uint id) { fmtid=new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"); pid=id; }
}
[StructLayout(LayoutKind.Explicit,Size=24)] public struct FadePropVariant {
 [FieldOffset(0)] public ushort vt;
 [FieldOffset(8)] public IntPtr value;
}
[ComImport,Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IFadePropertyStore {
 [PreserveSig] int GetCount(out uint count);
 [PreserveSig] int GetAt(uint index,out FadePropertyKey key);
 [PreserveSig] int GetValue(ref FadePropertyKey key,out FadePropVariant value);
 [PreserveSig] int SetValue(ref FadePropertyKey key,ref FadePropVariant value);
 [PreserveSig] int Commit();
}
public static class FadeTaskbarProperties {
 [DllImport("shell32.dll")] static extern int SHGetPropertyStoreForWindow(IntPtr window,ref Guid iid,out IFadePropertyStore store);
 [DllImport("ole32.dll")] static extern int PropVariantClear(ref FadePropVariant value);
 static IFadePropertyStore Open(IntPtr window){Guid id=typeof(IFadePropertyStore).GUID;IFadePropertyStore store;Marshal.ThrowExceptionForHR(SHGetPropertyStoreForWindow(window,ref id,out store));return store;}
 [DllImport("shell32.dll",CharSet=CharSet.Unicode)] static extern int SHGetPropertyStoreFromParsingName(string path,IntPtr bind,uint flags,ref Guid iid,out IFadePropertyStore store);
 public static void WriteShortcutId(string path,string appId){
  Guid iid=typeof(IFadePropertyStore).GUID;IFadePropertyStore store;
  Marshal.ThrowExceptionForHR(SHGetPropertyStoreFromParsingName(path,IntPtr.Zero,2,ref iid,out store));
  try{var key=new FadePropertyKey(5);var value=new FadePropVariant{vt=31,value=Marshal.StringToCoTaskMemUni(appId)};
   try{Marshal.ThrowExceptionForHR(store.SetValue(ref key,ref value));Marshal.ThrowExceptionForHR(store.Commit());}finally{PropVariantClear(ref value);}
  }finally{Marshal.ReleaseComObject(store);}
 }
 public static string ReadShortcutId(string path){
  Guid iid=typeof(IFadePropertyStore).GUID;IFadePropertyStore store;
  Marshal.ThrowExceptionForHR(SHGetPropertyStoreFromParsingName(path,IntPtr.Zero,0,ref iid,out store));
  try{var key=new FadePropertyKey(5);FadePropVariant value;Marshal.ThrowExceptionForHR(store.GetValue(ref key,out value));
   try{return value.vt==31?Marshal.PtrToStringUni(value.value):null;}finally{PropVariantClear(ref value);}
  }finally{Marshal.ReleaseComObject(store);}
 }
 public static string Read(IntPtr window,uint pid){var store=Open(window);try{var key=new FadePropertyKey(pid);FadePropVariant v;Marshal.ThrowExceptionForHR(store.GetValue(ref key,out v));try{return v.vt==31?Marshal.PtrToStringUni(v.value):"(unset vt="+v.vt+")";}finally{PropVariantClear(ref v);}}finally{Marshal.ReleaseComObject(store);}}
 public static void Write(IntPtr window,uint pid,string text){var store=Open(window);try{var key=new FadePropertyKey(pid);var v=new FadePropVariant{vt=31,value=Marshal.StringToCoTaskMemUni(text)};try{Marshal.ThrowExceptionForHR(store.SetValue(ref key,ref v));}finally{PropVariantClear(ref v);}}finally{Marshal.ReleaseComObject(store);}}
}
